const axios = require('axios');

/**
 * Service to interact with Meta WhatsApp Business Cloud API
 */
class WhatsAppService {
    constructor(config) {
        this.baseUrl = 'https://graph.facebook.com/v21.0';
        this.accessToken = config.apiKey;
        this.phoneId = config.phoneId;
        this.wabaId = config.businessAccountId;
    }

    get headers() {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Test the connection by fetching account details
     */
    async testConnection() {
        try {
            const response = await axios.get(`${this.baseUrl}/${this.phoneId}`, {
                headers: this.headers
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('WhatsApp API Connection Test Failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    /**
     * Fetch all approved templates for the WABA
     */
    async getTemplates() {
        try {
            const response = await axios.get(`${this.baseUrl}/${this.wabaId}/message_templates`, {
                headers: this.headers
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Failed to fetch WhatsApp templates:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Failed to fetch templates');
        }
    }

    /**
     * Build the components array required by Meta from stored template components.
     * Handles: HEADER (IMAGE/VIDEO/DOCUMENT), BODY (text variables), BUTTONS (quick reply).
     * 
     * @param {Array} templateComponents - The components array stored in DB (from Meta sync)
     * @param {Object} overrides - Optional overrides: { headerImageUrl, bodyParams: [] }
     */
    buildComponents(templateComponents = [], overrides = {}) {
        const result = [];

        for (const comp of templateComponents) {
            const type = comp.type?.toUpperCase();

            if (type === 'HEADER') {
                const format = comp.format?.toUpperCase();
                if (format === 'IMAGE') {
                    const imageUrl = overrides.headerImageUrl || comp.example?.header_handle?.[0];
                    if (imageUrl) {
                        result.push({
                            type: 'header',
                            parameters: [{ type: 'image', image: { link: imageUrl } }]
                        });
                    }
                } else if (format === 'VIDEO') {
                    const videoUrl = overrides.headerVideoUrl || comp.example?.header_handle?.[0];
                    if (videoUrl) {
                        result.push({
                            type: 'header',
                            parameters: [{ type: 'video', video: { link: videoUrl } }]
                        });
                    }
                } else if (format === 'DOCUMENT') {
                    const docUrl = overrides.headerDocUrl || comp.example?.header_handle?.[0];
                    if (docUrl) {
                        result.push({
                            type: 'header',
                            parameters: [{ type: 'document', document: { link: docUrl } }]
                        });
                    }
                }
                // TEXT headers don't need parameters unless they have variables
            }

            if (type === 'BODY') {
                // Check if body has variables like {{1}}, {{2}}
                const bodyText = comp.text || '';
                const varMatches = bodyText.match(/\{\{\d+\}\}/g);
                if (varMatches && varMatches.length > 0) {
                    const bodyParams = overrides.bodyParams || [];
                    const parameters = varMatches.map((_, i) => ({
                        type: 'text',
                        text: bodyParams[i] || `{{${i + 1}}}`
                    }));
                    result.push({ type: 'body', parameters });
                }
            }

            if (type === 'BUTTONS') {
                const buttons = comp.buttons || [];
                const buttonParams = overrides.buttonParams || []; // Expect array of { index: number, payload/text: string }

                buttons.forEach((btn, index) => {
                    const customParam = buttonParams.find(p => p.index === index);

                    if (btn.type === 'QUICK_REPLY') {
                        result.push({
                            type: 'button',
                            sub_type: 'quick_reply',
                            index: index.toString(),
                            parameters: [{
                                type: 'payload',
                                payload: customParam?.payload || btn.text || `reply_${index}`
                            }]
                        });
                    }

                    if (btn.type === 'URL' && btn.example) {
                        result.push({
                            type: 'button',
                            sub_type: 'url',
                            index: index.toString(),
                            parameters: [{
                                type: 'text',
                                text: customParam?.text || btn.example[0] || ''
                            }]
                        });
                    }
                });
            }
        }

        return result;
    }

    /**
     * Send a template-based message.
     * 
     * @param {string} to - Recipient phone number (E.164 format)
     * @param {string} templateName - Template name
     * @param {string} languageCode - Language code e.g. 'en_US', 'ar'
     * @param {Array} storedComponents - The components array from DB (from Meta sync)
     * @param {Object} overrides - Optional: { headerImageUrl, bodyParams }
     */
    async sendTemplateMessage(to, templateName, languageCode = 'en_US', storedComponents = [], overrides = {}) {
        try {
            const components = this.buildComponents(storedComponents, overrides);

            const payload = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                    ...(components.length > 0 && { components })
                }
            };

            console.log(`[WhatsAppService] Sending to ${to}:`, JSON.stringify(payload, null, 2));

            const response = await axios.post(`${this.baseUrl}/${this.phoneId}/messages`, payload, {
                headers: this.headers
            });
            return { success: true, messageId: response.data.messages[0].id };
        } catch (error) {
            const errorData = error.response?.data?.error || {};
            console.error('[WhatsAppService] Meta API Error:', JSON.stringify(errorData, null, 2));

            return {
                success: false,
                error: errorData.message || error.message,
                details: errorData // Return full detail for potential UI display
            };
        }
    }
}

module.exports = WhatsAppService;

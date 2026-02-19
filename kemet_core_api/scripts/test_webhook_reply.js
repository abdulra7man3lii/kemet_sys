const axios = require('axios');

async function simulateReply() {
    const webhookUrl = 'http://localhost:4000/api/whatsapp/webhook';

    // Simulate an incoming message from the number used in previous tests
    const payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "2320940848331477",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "+971521571985",
                                "phone_number_id": "1060087180511077"
                            },
                            "contacts": [
                                {
                                    "profile": {
                                        "name": "Jane Doe"
                                    },
                                    "wa_id": "971562104506"
                                }
                            ],
                            "messages": [
                                {
                                    "from": "971562104506",
                                    "id": "wamid.HBgMOTcxNTAxNDEyMTU5FQIAERgS",
                                    "timestamp": "1664443455",
                                    "text": {
                                        "body": "I am interested in the Ramadan Offer!"
                                    },
                                    "type": "text"
                                }
                            ]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    };

    try {
        console.log('Sending simulated webhook reply...');
        const response = await axios.post(webhookUrl, payload);
        console.log('Response Status:', response.status);
        console.log('Check backend logs for Lead creation message.');
    } catch (error) {
        console.error('Webhook Simulation Failed:', error.response?.data || error.message);
    }
}

simulateReply();

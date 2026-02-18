/**
 * DataCleaningService handles the "Data Laundry" logic.
 * It normalizes phone numbers, validates emails, and maps unorganized rows to CRM fields.
 */

const normalizePhone = (phone) => {
    if (!phone) return null;

    // Remove all non-numeric characters
    let cleaned = phone.toString().replace(/\D/g, '');

    // Simple logic for country codes (Example: if it starts with '05' and is 10 digits, assume UAE +971)
    if (cleaned.startsWith('05') && cleaned.length === 10) {
        cleaned = '971' + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith('5'))) {
        cleaned = '971' + cleaned;
    }

    // Add + prefix if missing (marketing APIs usually require it)
    if (!cleaned.startsWith('+') && cleaned.length > 0) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
};

const validateEmail = (email) => {
    if (!email) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase()) ? email.trim().toLowerCase() : null;
};

const cleanRow = (row, mapping) => {
    // mapping = { name: 'Name Column', email: 'Email Column', phone: 'Mobile', company: 'Org' }
    const cleaned = {
        name: row[mapping.name] || 'Unknown',
        email: validateEmail(row[mapping.email]),
        phone: normalizePhone(row[mapping.phone]),
        company: row[mapping.company] || null,
        status: 'LEAD', // Default status for imports
    };

    return cleaned;
};

module.exports = {
    normalizePhone,
    validateEmail,
    cleanRow
};

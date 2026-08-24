const { DOCUMENT_TYPES } = require('../../core/models/b2b/b2b.constants');

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const sendValidationError = (res, message) => res.status(400).json({ success: false, message });

const validateBusinessInfo = (req, res, next) => {
    const { businessName, email, phone, panNumber, gstNumber } = req.body;

    if (!businessName || !email || !phone) {
        return sendValidationError(res, 'Business name, email, and phone are required');
    }

    if (panNumber && !panRegex.test(String(panNumber).toUpperCase())) {
        return sendValidationError(res, 'Invalid PAN number');
    }

    if (gstNumber && !gstRegex.test(String(gstNumber).toUpperCase())) {
        return sendValidationError(res, 'Invalid GST number');
    }

    next();
};

const validateDocumentType = (documentType) => Object.values(DOCUMENT_TYPES).includes(documentType);

module.exports = {
    validateBusinessInfo,
    validateDocumentType,
    panRegex,
    gstRegex
};

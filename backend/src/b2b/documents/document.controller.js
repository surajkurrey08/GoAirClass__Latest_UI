const documentService = require('./document.service');

const handleError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

const uploadDocument = async (req, res) => {
    try {
        const document = await documentService.uploadDocument({
            agencyId: req.b2b.agencyId,
            userId: req.b2b.userId,
            payload: req.body,
            file: req.file
        });
        res.status(201).json({ success: true, message: 'Document submitted', document });
    } catch (error) {
        console.error('B2B document upload error:', error);
        handleError(res, error);
    }
};

const listDocuments = async (req, res) => {
    try {
        const documents = await documentService.listDocuments(req.b2b.agencyId);
        res.json({ success: true, documents });
    } catch (error) {
        console.error('B2B document list error:', error);
        handleError(res, error);
    }
};

module.exports = {
    uploadDocument,
    listDocuments
};

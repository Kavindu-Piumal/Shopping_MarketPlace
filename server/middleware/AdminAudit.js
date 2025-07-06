import AuditModel from "../models/audit.model.js";

// Audit middleware for admin chat access
export const auditAdminChatAccess = async (req, res, next) => {
    try {
        const userId = req.userId;
        const action = req.method + ' ' + req.originalUrl;
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Create audit log
        const auditLog = new AuditModel({
            adminId: userId,
            action: action,
            resource: 'chat_history',
            details: {
                chatId: req.params.chatId || null,
                searchTerm: req.query.search || null,
                filterStatus: req.query.filter || null,
                ipAddress: ipAddress,
                userAgent: userAgent
            },
            timestamp: new Date()
        });

        await auditLog.save();
        next();

    } catch (error) {
        console.error('Audit logging failed:', error);
        // Don't block the request if audit logging fails
        next();
    }
};

// Require justification for sensitive admin actions
export const requireJustification = (req, res, next) => {
    const { justification } = req.body;
    
    if (!justification || justification.trim().length < 10) {
        return res.status(400).json({
            message: "Justification required for accessing private communications",
            error: true,
            success: false
        });
    }
    
    next();
};

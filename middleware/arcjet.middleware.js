import aj from "../config/arcjet.js";
import { NODE_ENV } from "../config/env.js";

const arcjetMiddleware = async (req, res, next) => {
    const isWorkflowCallback =
        req.method === 'POST' &&
        req.path === '/api/v1/workflow/subscription/reminder';
    const clientIp = req.ip?.replace(/^::ffff:/, '');
    const isLocalDevelopmentCallback =
        NODE_ENV === 'development' &&
        (clientIp === '127.0.0.1' || clientIp === '::1');
    const hasQStashSigningKeys =
        Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY) &&
        Boolean(process.env.QSTASH_NEXT_SIGNING_KEY);

    if (isWorkflowCallback && (isLocalDevelopmentCallback || hasQStashSigningKeys)) {
        return next();
    }

    try {
        const decision = await aj.protect(req,{requested:1});

        if (decision.isDenied()) {
            if (isWorkflowCallback) {
                console.warn('Arcjet denied the QStash workflow callback');
            }

            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: 'Rate limit exceeded' });
            }

            if (decision.reason.isBot()) {
                return res.status(403).json({ error: 'Bot detected' });
            }

            return res.status(403).json({ error: 'Access denied' });
        }

        return next();
    } catch (error) {
        console.log(`Arcjet Middleware Error: ${error}`)
        next(error);
    }
}

export default arcjetMiddleware;
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    cancelSubscription,
    createSubscription,
    deleteSubscription,
    getSubscription,
    getSubscriptions,
    getUpcomingRenewals,
    getUserSubscription,
    updateSubscription,
} from "../controllers/subscription.controller.js";
const subscriptionRouter = Router()

subscriptionRouter.use(authMiddleware)

subscriptionRouter.post('/', createSubscription)
subscriptionRouter.get('/', getSubscriptions)
subscriptionRouter.get('/user/:id', getUserSubscription)
subscriptionRouter.get('/upcoming-renewals', getUpcomingRenewals)
subscriptionRouter.get('/:id', getSubscription)
subscriptionRouter.put('/:id', updateSubscription)
subscriptionRouter.patch('/:id/cancel', cancelSubscription)
subscriptionRouter.put('/:id/cancel', cancelSubscription)
subscriptionRouter.delete('/:id', deleteSubscription)


export default subscriptionRouter;
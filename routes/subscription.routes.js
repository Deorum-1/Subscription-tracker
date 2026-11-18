import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createSubscription, getUserSubscription } from "../controllers/subscription.controller.js";
const subscriptionRouter = Router()

subscriptionRouter.use(authMiddleware)

subscriptionRouter.get('/:id', (reg, res) => {
    res.send({ title: 'GET subscription details' })
})

subscriptionRouter.post('/', createSubscription)

subscriptionRouter.put('/:id', (reg, res) => {
    res.send({ title: 'UPDATE subscription' })
})
subscriptionRouter.delete('/:id', (reg, res) => {
    res.send({ title: 'DELETE subscription' })
})

subscriptionRouter.get('/user/:id', getUserSubscription)

subscriptionRouter.put('/:id/cancel', (reg, res) => {
    res.send({ title: 'CANCEL ALL SUBSCRIPTION' })
})
subscriptionRouter.get('/upcoming-renewals', (reg, res) => {
    res.send({ title: 'GET upcoming renewals' })
})


export default subscriptionRouter;
import { Router } from "express";
const authRouter = Router()

authRouter.post('sign-up', (reg, res) => {
    res.send({ title: 'Sign-Up' })
})
authRouter.post('sign-in', (reg, res) => {
    res.send({ title: 'Sign-in' })
})
authRouter.post('sign-out', (reg, res) => {
    res.send({ title: 'Sign-out' })
})

export default authRouter;
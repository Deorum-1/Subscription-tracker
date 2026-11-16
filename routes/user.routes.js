import { Router } from "express";
const userRouter = Router()

userRouter.get('/', (reg, res) => {
    res.send({ title: "Get all users" })
})
userRouter.get('/:id', (reg, res) => {
    res.send({ title: "Get user details" })
})
userRouter.post('/', (reg, res) => {
    res.send({ title: "create new user" })
})
userRouter.put('/:id', (reg, res) => {
    res.send({ title: "create new user" })
})
userRouter.delete('/:id', (reg, res) => {
    res.send({ title: "create new user" })
})

export default userRouter;
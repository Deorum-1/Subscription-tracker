import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { getUser, getUsers } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get('/', getUsers)

userRouter.get('/:id', authorize, getUser)

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
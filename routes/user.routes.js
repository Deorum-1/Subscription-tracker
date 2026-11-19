import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { getUser, getUsers } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get('/', authorize, getUsers)

userRouter.get('/:id', authorize, getUser)

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
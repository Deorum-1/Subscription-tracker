import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.js';
import User from '../models/user.model.js';

// A request body is an object containing data from the client(POST request)

export const signUp = async (req, res, next) => {
    const { name, email, password } = req.body ?? {};

    if (
        typeof name !== 'string' || !name.trim() ||
        typeof email !== 'string' || !email.trim() ||
        typeof password !== 'string' || password.length < 6
    ) {
        const error = new Error('Name, email, and a password of at least 6 characters are required');
        error.statusCode = 400;
        return next(error);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [newUser] = await User.create([{ name: name.trim(), email: normalizedEmail, password: hashedPassword }], { session });

        const token = jwt.sign({ userId: newUser._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUser,
            }
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        await session.endSession();
    }
}
export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body ?? {};

        if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
            const error = new Error('Email and password are required');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            const error = Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        })
    } catch (error) {
        next(error)
    }
}
export const signOut = async (req, res, next) => {
    // signOut logic
}
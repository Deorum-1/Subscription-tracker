import nodemailer from "nodemailer"
import { Email_password } from './env.js'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'feranmiisaac622@gmail.com',
        pass: Email_password
    }
})
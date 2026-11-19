import nodemailer from "nodemailer"
import { Email_password } from './env.js'

export const accountEmail = 'feranmiisaac622@gmail.com'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: accountEmail,
        pass: Email_password
    }
})

export default transporter
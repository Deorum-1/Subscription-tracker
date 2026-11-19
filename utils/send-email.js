import { emailTemplates } from './email.template.js'
import dayjs from 'dayjs'
import transporter, { accountEmail } from '../config/nodemailer.js'
import { SERVER_URL } from '../config/env.js'

export const sendReminderEmail = async ({ to, type, subscription }) => {
    if (!to || !type) throw new Error('Missing required parameters');

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) throw new Error('Invalid email type');

    const mailInfo = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.paymentMethod,
        accountSettingsLink: new URL('/account/settings', SERVER_URL).toString(),
        supportLink: new URL('/support', SERVER_URL).toString(),
    }

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message,
    }

    return transporter.sendMail(mailOptions)
}
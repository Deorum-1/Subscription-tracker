import dayjs from 'dayjs';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const { serve } = require('@upstash/workflow/express')
import Subscription from '../models/subscription.model.js';

const REMINDERS = [7, 5, 2, 1]

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    console.log(`Received reminder workflow for subscription ${subscriptionId}`);

    const subscription = await fetchSubscription(context, subscriptionId)

    if (!subscription) {
        console.log(`Subscription ${subscriptionId} was not found; stopping workflow.`);
        return;
    }

    if (subscription.status !== 'active') {
        console.log(`Subscription ${subscriptionId} is ${subscription.status}; stopping workflow.`);
        return;
    }

    const renewalDate = dayjs(subscription.renewalDate)

    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}.stopping workflow.`);
        return
    }

    let hasFutureReminder = false;

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        if (reminderDate.isAfter(dayjs())) {
            hasFutureReminder = true;
            await sleepUntilReminder(
                context,
                `Reminder ${daysBefore} days before`,
                reminderDate
            );
            await triggerReminder(context, `Reminder ${daysBefore} days before`)
        }
    }

    if (!hasFutureReminder) {
        console.log(`No future reminder dates for subscription ${subscriptionId}.`);
    }
})

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email')
    })
}

const sleepUntilReminder = async (context, label, reminderDate) => {
    console.log(`sleeping until ${label} reminder at ${reminderDate}`);
    await context.sleepUntil(label, reminderDate.toDate())
}

const triggerReminder = async (context, label) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} reminder`)
    })
}
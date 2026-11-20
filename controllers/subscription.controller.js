import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({ ...req.body, user: req.user._id });

        let workflowRunId;
        try {
            const result = await workflowClient.trigger({
                url: `${SERVER_URL}/api/v1/workflow/subscription/reminder`,
                body: { subscriptionId: subscription._id.toString() },
            });
            workflowRunId = result.workflowRunId;
        } catch (workflowError) {
            console.error('Subscription created, but reminder workflow could not be scheduled:', workflowError);
        }

        res.status(201).json({
            success: true,
            data: subscription,
            ...(workflowRunId ? { workflowRunId } : {}),
        });
    } catch (error) {
        next(error)
    }
}

export const getUserSubscription = async (req, res, next) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            const error = new Error('You are not the owner of this account')
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.user._id })

        res.status(200).json({ success: true, data: subscriptions })
    } catch (e) {
        next(e)
    }
}

export const getSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id })
            .sort({ renewalDate: 1 });
        res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
    } catch (error) {
        next(error);
    }
}

export const getSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
}

export const updateSubscription = async (req, res, next) => {
    try {
        const allowedFields = [
            'name',
            'price',
            'currency',
            'frequency',
            'category',
            'paymentMethod',
            'startDate',
            'renewalDate',
        ];
        const updates = Object.fromEntries(
            Object.entries(req.body ?? {}).filter(([key]) => allowedFields.includes(key))
        );

        if (Object.keys(updates).length === 0) {
            const error = new Error('No valid subscription fields were provided');
            error.statusCode = 400;
            throw error;
        }

        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status: 'cancelled' },
            { new: true, runValidators: true }
        );

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
}

export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
}

export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + days);

        const subscriptions = await Subscription.find({
            user: req.user._id,
            status: 'active',
            renewalDate: { $gte: now, $lte: end },
        }).sort({ renewalDate: 1 });

        res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
    } catch (error) {
        next(error);
    }
}
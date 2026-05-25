import { Router } from 'express';
import healthCheck from './health-check.js';
import razorpayRouter from './razorpay.js';
import cricketScoresRouter from './cricket-scores.js';
import weatherRouter from './weather.js';
import marketUpdatesRouter from './market-updates.js';
import socialMediaRouter from './social-media.js';
import walletRouter from './wallet.js';
import analyticsRouter from './analytics.js';
import walletAnalyticsRouter from './wallet-analytics.js';
import categoryPerformanceRouter from './category-performance.js';
import activityFeedRouter from './activity-feed.js';
import registrationRouter from './registration.js';
import newRegistrationRouter from './new-registration.js';
import adminPaymentVerificationRouter from './admin-payment-verification.js';
import adminRouter from './admin.js';
import adminNewsRouter from './admin-news.js';

const router = Router();

export default () => {
    router.use('/razorpay', razorpayRouter);
    router.use('/cricket-scores', cricketScoresRouter);
    router.use('/weather', weatherRouter);
    router.use('/market-updates', marketUpdatesRouter);
    router.use('/social-media', socialMediaRouter);
    router.use('/wallet', walletRouter);
    router.use('/analytics', analyticsRouter);
    router.use('/wallet-analytics', walletAnalyticsRouter);
    router.use('/category-performance', categoryPerformanceRouter);
    router.use('/activity-feed', activityFeedRouter);
    router.use('/registration', registrationRouter);
    router.use('/new-registration', newRegistrationRouter);
    router.use('/admin', adminPaymentVerificationRouter);
    router.use('/admin', adminRouter);
    router.use('/admin', adminNewsRouter);
    router.get('/health', healthCheck);

    return router;
};
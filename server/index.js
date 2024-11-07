require('dotenv').config();
const express = require('express');
const router = require('./router');
const { requireAuth, clerkMiddleware } = require('@clerk/express');

const app = express();


// if (!process.env.CLERK_SECRET_KEY) {
//     throw new Error("Clerk keys are missing from environment variables");
// }

app.use(clerkMiddleware({ secretKey: process.env.PUBLISHABLE_KEY }));

app.use(express.json());


app.use('/users', requireAuth(), router.userRouter);
app.use('/groups', requireAuth(), router.groupRouter);
app.use('/expenses', requireAuth(), router.expenseRouter);
app.use('/categories', requireAuth(), router.categoryRouter);

const port = 3000; 
app.listen(port, () => {
    console.log('Server running on http://127.0.0.1:3000');
})


require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const router = require('./router');
// const authMiddleware = require('./middlewares/auth')
const db = require('./models');
const cors = require('cors');

const app = express();


if (!process.env.SECRET_KEY) {
    throw new Error("Clerk keys are missing from environment variables");
}

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,  
}));
app.use(express.json());
app.use(cookieParser())

app.use(
    session({
        name: 'rovix',
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 *60,
        },
        proxy: true,
    })
)


app.use('/users', router.userRouter);
app.use('/groups', router.groupRouter);
app.use('/expenses', router.expenseRouter);
app.use('/categories', router.categoryRouter);

const port = 3000; 

db.sequelize.sync(
    // {force: true}
).then(() => {
    app.listen(port, () => {
        console.log('Server running on http://127.0.0.1:3000');
    })
}).catch(error => console.error('Failed to sync DB: ', error));

import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200,
    credentials: true,
}))
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());


// routers import
import userRouter from './routes/user.routes.js'

app.use('/api/v1/users',userRouter);


export { app } ;
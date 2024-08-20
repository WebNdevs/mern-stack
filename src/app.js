import cookieParser from "cookie-parser";
import express from 'express';
import cors from 'cors';

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
}))

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static('public'));
app.use(cookieParser());



// routes import 
import userRoute from './routes/user.routes.js'

app.use('/api/v1/users', userRoute);




export { app };
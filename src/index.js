import dotenv from 'dotenv';
import { DB_NAME } from './constants.js';
import ConnectDB from './db/index.js';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
dotenv.config({ path: "./env" });

ConnectDB()
    .then(() => {

        app.on('error', (error) => {
            console.log('Error ' + error)
        })

        app.listen(process.env.PORT, () => {
            console.log('Our app is runing at port ' + process.env.PORT)
        })
    })
    .catch((err) => {
        console.log('Mongodb connection faild ' + err)
    })



    
/*
(async () => {

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on('error', (error) => {
            console.log('Error ' + error)
        })

        app.listen(process.env.PORT, () => {
            console.log('App is listening on port ' + process.env.PORT);
        })

    } catch (error) {
        console.log('Error ' + error);
        throw error;
    }

})()
*/
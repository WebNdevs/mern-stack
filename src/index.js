import dotenv from 'dotenv';
import ConnectDB from './db/index.js';
import express from 'express';
import { app } from './app.js';

dotenv.config({ path: "./env" });

ConnectDB()
    .then(() => {

        app.on('error', (err) => {
            console.log('connection error ' + err);
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log("Our app is runing at port " + process.env.PORT)
        })
    })
    .catch((err) => console.log('Mongodb connection errro ' + err));





















    
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
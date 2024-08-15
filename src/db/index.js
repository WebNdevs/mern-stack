import { DB_NAME } from "../constants.js";
import express from 'express';
import mongoose from "mongoose";

const app = express();


const ConnectDB = async () => {
    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Mongodb connected !! DB HOST ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log('Error : ' + error);
        process.exit(1);
    }
}

export default ConnectDB; 

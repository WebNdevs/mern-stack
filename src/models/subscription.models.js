import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    chanel:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chanel'
    }

}, { timestamps: true })


export const Subscription = mongoose.model("Subscription", subscriptionSchema);
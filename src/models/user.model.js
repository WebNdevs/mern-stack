import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],

    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowocase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowocase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avtar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, ' Password is required'],
        unique: true
    },
    refreshToken: {
        type: String,
    }

}, { timestamps: true });

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next();
    await  bcrypt.hash(this.password, 8);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRecreshToken = function () {
    jwt.sign({
        _id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);
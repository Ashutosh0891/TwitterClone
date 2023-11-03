const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true,
        trim: true
    },
    lastname: {
        type: String,
        require: true,
        trim: true
    },
    username: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: '/images/profilePic.jpg'
    },
    coverPhoto: {
        type: String
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true })

const User = mongoose.model('User', userSchema);
module.exports = User;
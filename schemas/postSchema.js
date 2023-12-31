const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        require: true,
        trim: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pinned: { type: Boolean },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    retweetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    retweetData: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    pinned: { type: Boolean }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
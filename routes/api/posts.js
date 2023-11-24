const express = require('express');
const Post = require('../../schemas/postSchema');
const User = require('../../schemas/userSchema');
const Notification = require('../../schemas/notificationSchema');
const app = express();
const router = express.Router();

app.use(express.urlencoded({ extended: false }))

router.get('/', async (req, res, next) => {
    try {
        let searchObj = req.query;
        if (searchObj) {
            if (searchObj.isReply !== undefined) {
                let isReply = searchObj.isReply;
                searchObj.replyTo = { $exists: isReply };
                delete searchObj.isReply;
            }

            if (searchObj.search !== undefined) {
                searchObj.content = { $regex: searchObj.search, $options: "i" };
                delete searchObj.search;
            }

            if (searchObj.followingOnly !== undefined) {
                let followingOnly = searchObj.followingOnly;
                if (followingOnly == "true") {
                    // get all the users that are followed by current user and then find posts from those users only
                    let objectIds = [];
                    if (!req.session.user.following) {
                        req.session.user.following = [];
                    }
                    req.session.user.following.forEach(userId => {
                        objectIds.push(userId);
                    })
                    objectIds.push(req.session.user._id);
                    searchObj.postedBy = { $in: objectIds };
                }
                delete searchObj.followingOnly;
            }
        }
        let results = await getPosts(searchObj);
        res.status(200).send(results)

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

});

router.get('/:id', async (req, res, next) => {
    try {
        let postId = req.params.id;
        let post = await Post.findById(postId).populate("postedBy").populate("replyTo").populate("retweetData");
        post = await User.populate(post, { path: "replyTo.postedBy" })
        let resultPosts = await User.populate(post, { path: "retweetData.postedBy" });

        let results = {
            postData: resultPosts
        }
        if (resultPosts.replyTo !== undefined) {
            results.replyTo = resultPosts.replyTo
        }
        let singlePostReplies = await Post.find({ replyTo: postId }).populate("postedBy").populate("replyTo").populate("retweetData");
        singlePostReplies = await User.populate(singlePostReplies, { path: "replyTo.postedBy" });
        let repliesPostResults = await User.populate(singlePostReplies, { path: "retweetData.postedBy" });

        results.replies = repliesPostResults;
        res.status(200).send(results);

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})

router.post('/', async (req, res, next) => {
    try {
        if (!req.body.content) {
            console.log("content is absent")
            res.status(400)
        }
        let replyPostId;
        if (req.body.replyTo) {
            replyPostId = req.body.replyTo;
        }
        let post = new Post({
            content: req.body.content,
            postedBy: req.session.user._id,
            replyTo: replyPostId
        })
        await post.save();
        let postData = await User.populate(post, { path: "postedBy" });
        postData = await Post.populate(postData, { path: "replyTo" });

        //send notification for replies
        if (post.replyTo !== undefined) {
            await Notification.insertNotification(postData.replyTo.postedBy, req.session.user._id, "reply", postData._id);
        }
        res.status(201).send(postData)
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})

router.put('/:id/like', async (req, res, next) => {
    try {
        let postId = req.params.id;
        let userId = req.session.user._id;

        let isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
        let option = isLiked ? '$pull' : '$addToSet';
        // update the likes array of the user document
        req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true });

        let post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true });
        res.status(200).send(post);

        //send notification for likes
        if (!isLiked) {
            await Notification.insertNotification(post.postedBy, userId, "like", post._id);
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.post('/:id/retweet', async (req, res, next) => {
    try {
        let postId = req.params.id;
        let userId = req.session.user._id;
        console.log(userId);
        let deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId });
        let option = deletedPost != null ? '$pull' : '$addToSet';

        let repost = deletedPost;
        if (repost == null) {
            repost = new Post({
                postedBy: userId,
                retweetData: postId
            });
            await repost.save();
        }
        let userUpdate = {};
        userUpdate[option] = { retweets: repost._id };
        req.session.user = await User.findByIdAndUpdate(userId, userUpdate, { new: true });

        let postUpdate = {};
        postUpdate[option] = { retweetUsers: userId }
        let post = await Post.findByIdAndUpdate(postId, postUpdate, { new: true });
        console.log(post)
        res.status(200).send(post);

        //send notification for retweet
        if (!deletedPost) {
            await Notification.insertNotification(post.postedBy, userId, "retweet", post._id);
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }


})

router.delete('/:id', async (req, res, next) => {
    let userId = req.session.user._id;
    let postId = req.params.id;
    let post = await Post.findById(postId);
    let user = await User.findById(userId);
    try {
        if (postId) {
            await Post.findByIdAndDelete(postId);
            if (post.retweetData) {
                await Post.findByIdAndUpdate(post.retweetData, { $pull: { retweetUsers: userId } });

            } else {
                let retweetedPost = await Post.findOne({ retweetData: postId });
                if (retweetedPost && user.retweets && user.retweets.includes(retweetedPost._id)) {
                    req.session.user = await User.findByIdAndUpdate(userId, { $pull: { retweets: retweetedPost._id } }, { new: true });
                }
            }

            await Post.deleteMany({ retweetData: postId });
            await Post.deleteMany({ replyTo: { $exists: true }, replyTo: postId });

            if (user.retweets.includes(postId)) {
                req.session.user = await User.findByIdAndUpdate(userId, { $pull: { retweets: postId } }, { new: true });
            }
            if (user.likes.includes(postId)) {
                req.session.user = await User.findByIdAndUpdate(userId, { $pull: { likes: postId } }, { new: true });
            }

            res.sendStatus(202);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

});

router.put('/:id', async (req, res, next) => {
    try {

        const { pinned } = req.body;
        let postId = req.params.id;
        if (req.body.pinned !== undefined) {
            await Post.updateMany({ postedBy: req.session.user._id }, { pinned: false });
        }

        await Post.findByIdAndUpdate(postId, { pinned });
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})

async function getPosts(filter) {
    let results = await Post.find(filter)
        .populate("postedBy")
        .populate("retweetData")
        .populate("replyTo")
        .sort({ "createdAt": -1 })
    results = await User.populate(results, { path: "replyTo.postedBy" })
    return await User.populate(results, { path: "retweetData.postedBy" });
}
module.exports = router;
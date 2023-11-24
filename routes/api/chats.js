const express = require('express');
const router = express.Router();
const Chat = require('../../schemas/chatSchema');
const User = require('../../schemas/userSchema');
const Message = require('../../schemas/messageSchema');


router.post('/', async (req, res, next) => {
    try {
        if (!req.body.users) {
            console.log("users param not sent with request");
            return res.sendStatus(400);
        }
        let users = JSON.parse(req.body.users) //to json object;
        if (users.length == 0) {
            return res.sendStatus(400);
        }

        users.push(req.session.user); //to get chat between loggedIn user and chat user

        let results = new Chat({
            users: users,
            isGroupChat: true
        })
        await results.save();
        console.log(results)
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

});

router.get('/', async (req, res, next) => {
    try {
        let results = await Chat
            .find({ users: { $elemMatch: { $eq: req.session.user._id } } })//checks the element in array that is equal to loggedin userId
            .populate("users")
            .populate("latestMessage")
            .sort({ "updatedAt": -1 });
        console.log("before results", results)
        if (req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
            results = results.filter(r => r.latestMessage && r.latestMessage.readBy && !r.latestMessage.readBy.includes(req.session.user._id));
            console.log("after filter", results)
        }
        await User.populate(results, { path: "latestMessage.sender" });
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});
router.get('/:chatId', async (req, res, next) => {
    try {
        let chatId = req.params.chatId;
        let results = await Chat
            .findOne({ _id: chatId, users: { $elemMatch: { $eq: req.session.user._id } } })
            .populate("users")
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.put('/:chatId', async (req, res, next) => {
    try {
        let chatId = req.params.chatId;
        let chatName = req.body.chatName;
        if (chatName) {
            let results = await Chat.findByIdAndUpdate(chatId, { chatName: chatName });
            res.sendStatus(204);
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.get('/:chatId/messages', async (req, res, next) => {
    try {
        let chatId = req.params.chatId;
        let results = await Message.find({ chat: chatId }).populate("sender");
        res.status(200).send(results);
    } catch (error) {

    }
});

router.put("/:chatId/messages/markAsRead", async (req, res, next) => {
    try {

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
    await Message.updateMany({ chat: req.params.chatId }, { $addToSet: { readBy: req.session.user._id } });
    res.sendStatus(204);

})

module.exports = router;
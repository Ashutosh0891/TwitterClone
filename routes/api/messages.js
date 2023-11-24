const express = require('express');
const router = express.Router();
const Message = require('../../schemas/messageSchema');
const Chat = require('../../schemas/chatSchema');
const User = require('../../schemas/userSchema');
const Notification = require('../../schemas/notificationSchema');


router.post('/', async (req, res, next) => {
    try {
        let content = req.body.content;
        let chatId = req.body.chatId;

        if (!content || !chatId) {
            console.log("Invalid data");
            return res.sendStatus(400);
        }
        console.log(req.session.user._id);
        let message = new Message({
            sender: req.session.user._id,
            content: content,
            chat: chatId
        });
        await message.save();
        await message.populate("sender");
        await message.populate("chat");
        await User.populate(message, { path: "chat.users" });
        let chat = await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
        console.log(chat)
        insertNotifications(chat, message);

        res.status(201).send(message);


    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})

function insertNotifications(chat, message) {
    console.log(chat)
    chat.users.forEach(userId => {
        if (userId == message.sender._id) { return; }
        Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
    });
}

module.exports = router;
const express = require('express');
const router = express.Router();
const Message = require('../../schemas/messageSchema');
const Chat = require('../../schemas/chatSchema');


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
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message })

        res.status(201).send(message);


    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})

module.exports = router;
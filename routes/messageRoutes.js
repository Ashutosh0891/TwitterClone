const express = require('express');
const router = express.Router();
const Chat = require('../schemas/chatSchema');
const User = require('../schemas/userSchema');
const mongoose = require('mongoose');


router.get('/', async (req, res, next) => {
    try {
        let payload = {
            pageTitle: "Inbox",
            userLoggedIn: req.session.user,
            userLoggedInJS: JSON.stringify(req.session.user),
        }
        res.status(200).render("inbox", payload);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

})
router.get('/new', async (req, res, next) => {
    try {
        let payload = {
            pageTitle: "New Message",
            userLoggedIn: req.session.user,
            userLoggedInJS: JSON.stringify(req.session.user),
        }
        res.status(200).render("newMessages", payload);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

});

router.get('/:chatId', async (req, res, next) => {
    try {
        let userId = req.session.user._id;
        let chatId = req.params.chatId;
        let isValidChatId = mongoose.isValidObjectId(chatId);

        let payload = {
            pageTitle: "Chats",
            userLoggedIn: req.session.user,
            userLoggedInJS: JSON.stringify(req.session.user),
        }

        if (!isValidChatId) {
            payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
            return res.status(400).render("chatPage", payload);
        }

        let chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId } } }).populate("users");

        if (chat == null) {
            let userFound = await User.findById(chatId); //in profile page where we can access chats with profileUser 
            if (userFound != null) {
                //create chat with the with profile user
                chat = await getChatByUserId(userId, userFound._id);
            }
        }
        if (chat == null) {
            payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
        } else {
            payload.chat = chat;
        }

        res.status(200).render("chatPage", payload);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});


//to create the chat with profile user id to check if it exists or not if not then add
// function getChatByUserId(userLoggedInId, otherUserId) {
//     return Chat.findOneAndUpdate({
//         isGroupChat: false,
//         users: {
//             $size: 2,
//             $all: [
//                 { $elemMatch: { $eq: userLoggedInId } },
//                 { $elemMatch: { $eq: otherUserId } },
//             ]
//         }
//     },
//         {
//             // to add if above conditions did not satisfy
//             $setOnInsert: {
//                 users: [userLoggedInId, otherUserId]
//             }
//         }, {
//         new: true,
//         upsert: true //to make changes if dont exists
//     }).populate("users");
// }
async function getChatByUserId(userLoggedInId, otherUserId) {
    // Find an existing chat with the given users
    let chat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [userLoggedInId, otherUserId] }
    }).populate("users");

    if (!chat) {
        // If no existing chat is found, create a new one
        chat = await Chat.create({
            isGroupChat: false,
            users: [userLoggedInId, otherUserId]
        });
    }

    return chat;
}



module.exports = router;
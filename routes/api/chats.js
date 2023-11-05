const express = require('express');
const router = express.Router();
const Chat = require('../../schemas/chatSchema');


router.post('/', async (req, res, next) => {
    try {
        if (!req.body.users) {
            console.log("users param not sent with request");
            return res.sendStatus(400);
        }
        let users = JSON.parse(req.body.users) //to json object;
        console.log(users);
        if (users.length == 0) {
            return res.sendStatus(400);
        }

        users.push(req.session.user); //apart chat between loggedIn user and chat user

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

})
module.exports = router;
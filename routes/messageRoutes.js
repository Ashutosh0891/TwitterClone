const express = require('express');
const router = express.Router();


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

})


module.exports = router;
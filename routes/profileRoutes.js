const express = require('express');
const User = require('../schemas/userSchema');
const app = express();
const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        let payLoad = {
            pageTitle: req.session.user.username,
            userLoggedIn: req.session.user,
            userLoggedInJS: JSON.stringify(req.session.user),
            profileUser: req.session.user,
        }
        res.status(200).render("profilePage", payLoad)
    } catch (error) {
        console.log(error)
    }

});

router.get('/:username', async (req, res, next) => {
    let payload = await getPayload(req.params.username, req.session.user);
    res.status(200).render("profilePage", payload)
})
router.get('/:username/replies', async (req, res, next) => {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "replies";
    res.status(200).render("profilePage", payload)
})
router.get('/:username/followers', async (req, res, next) => {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";
    res.status(200).render("followersAndFollowing", payload)
})
router.get('/:username/following', async (req, res, next) => {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";
    res.status(200).render("followersAndFollowing", payload)
})

async function getPayload(username, userLoggedIn) {
    let user = await User.findOne({ username: username }); //find by username
    if (user == null) {
        user = await User.findById(username); //find by id of user
        if (user == null) {
            return {
                pageTitle: "user not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJS: JSON.stringify(userLoggedIn)
            }
        }

    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJS: JSON.stringify(userLoggedIn),
        profileUser: user,
    }
}

module.exports = router;
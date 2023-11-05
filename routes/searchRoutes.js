const express = require('express');
const router = express.Router();


router.get('/', async (req, res, next) => {
    try {
        let payload = createPayload(req.session.user)
        res.status(200).render("searchPage", payload);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

})
router.get('/:selectedTab', async (req, res, next) => {
    try {
        let payload = createPayload(req.session.user);
        payload.selectedTab = req.params.selectedTab;
        res.status(200).render("searchPage", payload);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})

function createPayload(userLoggedIn) {
    return {
        pageTitle: "Search",
        userLoggedIn: userLoggedIn,
        userLoggedInJS: JSON.stringify(userLoggedIn),
    }
}

module.exports = router;
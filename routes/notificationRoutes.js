const express = require('express');
const app = express();
const router = express.Router();

router.get('/', (req, res, next) => {
    let payLoad = {
        pageTitle: "Notifications",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
    }
    res.render("notificationPage", payLoad)
})

module.exports = router;
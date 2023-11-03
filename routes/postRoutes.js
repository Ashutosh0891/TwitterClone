const express = require('express');
const app = express();
const router = express.Router();

router.get('/:id', (req, res, next) => {
    let payLoad = {
        pageTitle: "View Post",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        postId: req.params.id
    }
    res.render("postPage", payLoad)
})

module.exports = router;
const express = require('express');
const router = express.Router();
const app = express();

app.set("view engine", "pug"); //set template engine to pug
app.set("views", "views"); //set views in views folder


router.get('/login', (req, res, next) => {
    res.render("login")
})

module.exports = router;
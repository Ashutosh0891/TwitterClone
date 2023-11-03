const express = require('express');
const router = express.Router();
const app = express();
const User = require('../schemas/userSchema')
const bcrypt = require('bcrypt')

app.set("view engine", "pug"); //set template engine to pug
app.set("views", "views"); //set views in views folder
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

router.get('/', (req, res, next) => {
    res.render("register")
})

router.post('/', async (req, res, next) => {
    let fname = req.body.fname.trim()
    let lname = req.body.lname.trim()
    let username = req.body.username.trim()
    let email = req.body.email.trim()
    let password = req.body.password.trim()

    let payload = req.body;
    try {
        if (fname && lname && username && email && password) {
            //to check with either username or email as both fields are unique
            let registeredUser = await User.findOne({
                $or: [
                    { username: username },
                    { email: email }
                ]
            })
            if (registeredUser) {
                if (registeredUser.email == email) {
                    payload.errorMessage = "email exists already"
                } else {
                    payload.errorMessage = "username exists already"
                }
                res.status(200).render("register", payload)
            }
            let hashPassword = await bcrypt.hash(password, 10);
            let user = new User({
                firstname: fname,
                lastname: lname,
                username: username,
                email: email,
                password: hashPassword
            })
            await user.save();
            // req.session.user = user;
            // console.log(req.session)
            return res.redirect('/login')


        } else {
            payload.errorMessage = "Any field should not be empty"
            res.status(200).render("register", payload)
        }
    }

    catch (error) {
        console.log(error)
        payload.errorMessage = "Something went wrong"
        res.status(400).render("register", payload)
    }
})

module.exports = router;
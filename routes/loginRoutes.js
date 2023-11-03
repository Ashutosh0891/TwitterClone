const express = require('express');
const User = require('../schemas/userSchema');
const router = express.Router();
const app = express();
const bcrypt = require('bcrypt');

app.set("view engine", "pug"); //set template engine to pug
app.set("views", "views"); //set views in views folder
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


router.get('/', (req, res, next) => {
    res.render("login")
})

// router.post('/', async (req, res, next) => {
//     let usernameOrEmail = req.body.username.trim();
//     let password = req.body.password.trim();

//     let payload = req.body;
//     try {
//         if (usernameOrEmail && password) {
//             let user = await User.findOne({
//                 $or: [
//                     { email: usernameOrEmail },
//                     { username: usernameOrEmail }
//                 ]
//             })
//             if (!user) {
//                 payload.errorMessage = "Invalid Credentials"
//                 return res.status(401).render("login", payload)
//             }
//             const passMatch = await bcrypt.compare(password, user.password)
//             if (!passMatch) {
//                 payload.errorMessage = "Invalid Credentials"
//                 return res.status(401).render("login", payload)
//             } else {
//                 req.session.user = user;
//                 console.log(req.session.user)
//                 return res.redirect('/')
//             }

//         }
//         else {
//             payload.errorMessage = "Any field should not be empty"
//             res.status(200).render("login", payload)
//         }
//     } catch (error) {
//         console.log(error);
//         payload.errorMessage = "something went wrong"
//         res.status(400).render("login", payload)
//     }
// })

router.post('/', async (req, res, next) => {
    let usernameOrEmail = req.body.username.trim();
    let password = req.body.password.trim();

    let payload = req.body;
    try {
        if (usernameOrEmail && password) {
            let user = await User.findOne({
                $or: [
                    { email: usernameOrEmail },
                    { username: usernameOrEmail }
                ]
            });
            payload.errorMessage = "InvalidCredentials"
            if (!user) {
                return res.status(401).render("login", payload);
            }
            const passMatch = await bcrypt.compare(password, user.password);
            if (!passMatch) {
                return res.status(401).render("login", payload);
            }
            req.session.user = user;
            console.log(req.session)
            return res.redirect("/");
        } else {
            payload.errorMessage = "any field can't be blank";
            res.status(200).render('login', payload);
        }


    } catch (error) {
        console.log(error);
        payload.errorMessage = "something went wrong";
        res.status(500).render("login", payload)

    }

})

module.exports = router;
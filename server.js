const express = require('express');
const dotenv = require('dotenv');
const { requireLogin } = require('./middlewares/middleware');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('./db');
const session = require('express-session')



const PORT = process.env.PORT || 3001;
dotenv.config();

const app = express();

connectDB();

app.set("view engine", "pug"); //set template engine to pug
app.set("views", "views"); //set views in views folder

app.use(express.urlencoded({ extended: false }));// to parse html data
app.use(express.json())
app.use(express.static(path.join(__dirname, "public"))) //serve the static files for css
app.use(session({
    secret: 'tandoori paneer',
    resave: true,
    saveUninitialized: false
}))


app.use('/api/v1/auth', loginRoutes);
app.use('/api/v1/auth', registerRoutes);

app.get("", requireLogin, (req, res) => {

    let payLoad = {
        pageTitle: "TwitterClone",
        userLoggedIn: req.session.user
    }
    res.render("home", payLoad)
})

app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
});
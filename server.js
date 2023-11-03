const express = require('express');
const dotenv = require('dotenv');
const { requireLogin } = require('./middlewares/middleware');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const logoutRoutes = require('./routes/logout');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('./db');
const session = require('express-session');
const postApiRoute = require('./routes/api/posts');
const userApiRoute = require('./routes/api/users');



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



app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);
app.use('/posts', requireLogin, postRoutes);
app.use('/profile', requireLogin, profileRoutes);
app.use('/uploads', uploadRoutes);

app.use('/api/posts', postApiRoute);
app.use('/api/users', userApiRoute);

app.get("/", requireLogin, (req, res) => {

    let payLoad = {
        pageTitle: "TwitterClone",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user) //take this value and inject into page after rendering of page
    }
    res.render("home", payLoad)
})

app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
});

//payload variables are purely used while rendering once rendered they become useless
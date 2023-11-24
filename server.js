const express = require('express');
const dotenv = require('dotenv');
const { requireLogin } = require('./middlewares/middleware');
const loginRoutes = require('./routes/loginRoutes');
const registerRoutes = require('./routes/registerRoutes');
const logoutRoutes = require('./routes/logout');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const { connectDB } = require('./db');
const session = require('express-session');
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');




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


//Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);
app.use('/posts', requireLogin, postRoutes);
app.use('/profile', requireLogin, profileRoutes);
app.use('/search', requireLogin, searchRoutes);
app.use('/uploads', uploadRoutes);
app.use('/messages', requireLogin, messageRoutes);
app.use('/notifications', requireLogin, notificationRoutes);


//Api routes
app.use('/api/posts', postsApiRoute);
app.use('/api/users', usersApiRoute);
app.use('/api/chats', chatsApiRoute);
app.use('/api/messages', messagesApiRoute);
app.use('/api/notifications', notificationsApiRoute);

let user;
app.get("/", requireLogin, (req, res) => {
    user = req.session.user.firstname + " " + req.session.user.lastname;
    let payLoad = {
        pageTitle: "TwitterClone",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user) //take this value and inject into page after rendering of page
    }
    res.render("home", payLoad)
})

const server = app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
});
const io = socketIO(server, { pingTimeout: 60000 }); // Initialize Socket.IO

io.on("connection", (socket) => {
    console.log("connected to socket io :", user);

    //accepts event named setup from client
    socket.on("setup", (userData) => {
        socket.join(userData._id);        // whichever user joins the room the userid joins the chatroom who establishes connection
        socket.emit("connection")         // emits or triggers event named connection to client

    })

    socket.on("join room", room => socket.join(room));
    socket.on("typing", room => socket.in(room).emit("typing"));// in means broadcast everyone except for the sender
    socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    socket.on("notification received", room => socket.in(room).emit("notification received"));

    socket.on("new message", newMessage => {
        let chat = newMessage.chat;

        if (!chat.users) {
            return console.log("chat.users not populated");
        }
        chat.users.forEach(user => {
            if (user._id == newMessage.sender._id) {
                return;
            }
            socket.in(user._id).emit("message received", newMessage);// broadcast messages to indiviual users except for sender even if they arent on chat page
        });
    })
})


//payload variables are purely used while rendering ,once rendered they become useless
let connected = false;

let socket = io("http://localhost:3001"); //connection from client to server
socket.emit("setup", userLoggedIn); //emits event named setup to server

//accepts event named connection from server
socket.on("connection", () => {
    connected = true;
});

socket.on("message received", (newMessage) => {
    messageReceived(newMessage);
})

socket.on("notification received", (newNotification) => {
    $.get('/api/notifications/latest', (notificationData) => {
        showNotificationPopup(notificationData);
        refreshNotificationsBadge();
    })
})

function emitNotification(userId) {
    if (userId == userLoggedIn._id) return;

    socket.emit("notification received", userId)
}
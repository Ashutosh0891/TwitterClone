$(document).ready(() => {
    $.get('/api/notifications', (data) => {
        console.log(data)
        outputNotificationList(data, $(".resultsContainer"));
    })
})

$("#markNotificationsAsRead").click(() => markNotificationsAsOpened());


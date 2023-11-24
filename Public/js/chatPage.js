let typing = false;
let lastTypingTime;

$(document).ready(() => {

    socket.emit("join room", chatId);
    socket.on("typing", () => {
        $(".typingDots").show();
    });
    socket.on("stop typing", () => {
        $(".typingDots").hide();
    });

    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data));
    })

    $.get(`/api/chats/${chatId}/messages`, (data) => {
        console.log(data)
        let messages = [];
        let lastSenderId = "";

        data.forEach((message, index) => {
            let html = createMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);
            lastSenderId = message.sender._id;
        });

        let messagesHtml = messages.join("");
        console.log(messagesHtml)
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);
        markAllMessagesAsRead();

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible");
    })

})

$("#chatNameButton").click(() => {
    var name = $("#chatNameTextBox").val().trim();

    $.ajax({
        url: "/api/chats/" + chatId,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, xhr) => {
            if (xhr.status != 204) {
                alert("could not update");
            }
            else {
                location.reload();
            }
        }
    })
});

$(".sendMessageButton").click(() => {
    messagSubmitted();
});
$(".inputTextbox").keydown((event) => {
    updateTyping();

    if (event.which == 13) {
        messagSubmitted();
        return false;
    }
});

function updateTyping() {

    if (!connected) {
        return;
    }

    if (!typing) {
        typing = true;
        socket.emit("typing", chatId);
    }
    lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    // set 3 sec timer for typing dots if typing stops for 3 sec,then after 3 sec typing dots disappears
    setTimeout(() => {
        let timerNow = new Date().getTime();
        let timeDiff = timerNow - lastTypingTime;

        if (timeDiff >= timerLength) {
            socket.emit("stop typing", chatId);
            typing = false;
        }
    }, timerLength)

}

function addMessagesHtmlToPage(html) {
    $(".chatMessages").append(html);
}


function messagSubmitted() {
    let content = $(".inputTextbox").val().trim();
    if (content != "") {
        sendMessage(content);
        $(".inputTextbox").val("");
        socket.emit("stop typing", chatId);
        typing = false;
    }

}
function sendMessage(content) {
    $.post("/api/messages", { content: content, chatId: chatId }, (data, status, xhr) => {

        if (xhr.status !== 201) {
            alert("Could not send the message");
            $(".inputTextbox").val(content);
        }
        addChatMessageHtml(data);

        if (connected) {
            socket.emit("new message", data);
        }
    })
}

function addChatMessageHtml(message) {
    if (!message || !message._id) {
        alert("message is not valid");
    }
    let messageDiv = createMessageHtml(message, null, "");
    addMessagesHtmlToPage(messageDiv);
    scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
    let sender = message.sender;
    let senderName = sender.firstname + " " + sender.lastname;

    let currentSenderId = sender._id;
    let nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    let isFirstMessage = lastSenderId != currentSenderId;
    let isLastMessage = nextSenderId != currentSenderId;

    let isMine = message.sender._id == userLoggedIn._id;
    let liClassName = isMine ? "mine" : "theirs";

    let nameElement = "";
    if (isFirstMessage) {
        liClassName += " first";

        if (!isMine) {
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }
    let profileImage = "";
    if (isLastMessage) {
        liClassName += " last";
        profileImage = `<img src='${sender.profilePicture}'>`
    }

    let imageContainer = "";
    if (!isMine) {
        imageContainer = `<div class='imageContainer'>
                            ${profileImage}
                        </div>`
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated) {
    let container = $(".chatMessages");
    let scrollHeight = container[0].scrollHeight;

    if (animated) {
        container.animate({ scrollTop: scrollHeight }, "slow");
    } else {
        container.scrollTop(scrollHeight)
    }
}

function markAllMessagesAsRead() {
    $.ajax({
        url: `/api/chats/${chatId}/messages/markAsRead`,
        type: "PUT",
        success: () => refreshMessagesBadge()
    })
}
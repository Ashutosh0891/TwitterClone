$(document).ready(() => {
    $.get("/api/chats", (data, status, xhr) => {
        if (xhr.status == 400) {
            alert("chat list isn't available")
        } else {

            outputChatList(data, $(".resultsContainer"));
        }
    })

})

function outputChatList(chatList, container) {
    chatList.forEach(chat => {
        let html = createChatHtml(chat);
        container.append(html);
    });

    if (chatList.length == 0) {
        container.append("<span class='noResults'>no results available</span>")
    }
}

function createChatHtml(chatData) {
    console.log(chatData)
    let chatName = getChatName(chatData);
    let image = getChatImageElements(chatData);
    let latestMessage = getLatestMessage(chatData.latestMessage)

    return `<a style="text-decoration: none;" href='/messages/${chatData._id}' class='resultListItem'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`;
}

function getLatestMessage(latestMessage) {
    if (latestMessage != null) {
        let sender = latestMessage.sender;
        return `${sender.firstname} ${sender.lastname}: ${latestMessage.content}`;
    }
    return "New Chat"
}


function getChatImageElements(chatData) {
    let otherChatUsers = getOtherChatUsers(chatData.users);
    let groupChatClass = "";

    let chatImage = getUserChatImageElement(otherChatUsers[0]);

    if (otherChatUsers.length > 1) {
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }
    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}
function getUserChatImageElement(user) {
    if (!user || !user.profilePicture) {
        return alert("user is invalid");
    }

    return `<img src='${user.profilePicture}' alt='User's profile pic'>`;
}

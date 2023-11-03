$(document).ready(() => {
    if (selectedTab == "replies") {
        loadReplies();
    } else {
        loadPosts();
    }

})

function loadPosts() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, resultData => {
        console.log(resultData)
        displayPosts(resultData, $(".postsContainer"));
    })
}
function loadReplies() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, resultData => {
        console.log(resultData)
        displayPosts(resultData, $(".postsContainer"));
    })
}

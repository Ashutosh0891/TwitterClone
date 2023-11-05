$(document).ready(() => {
    if (selectedTab == "replies") {
        loadReplies();
    } else {
        loadPosts();
    }

})

function loadPosts() {

    $.get('/api/posts', { postedBy: profileUserId, pinned: true }, resultData => {
        displayPinnedPost(resultData, $(".pinnedPostContainer"));
    })
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

function displayPinnedPost(results, container) {
    container.html("");
    if (results.length == 0) {
        container.hide();
        return;
    }
    results.forEach(element => {
        let html = createPostHtml(element)
        container.append(html);
    });

}

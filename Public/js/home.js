$(document).ready(() => {
    $.get("/api/posts", { followingOnly: true }, resultData => {
        console.log(resultData)
        displayPosts(resultData, $(".postsContainer"));
    })

})


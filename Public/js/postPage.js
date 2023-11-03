$(document).ready(() => {
    $.get("/api/posts/" + postId, resultData => {
        console.log(resultData)
        displayPostsWithReplies(resultData, $(".postsContainer"));
    })

})

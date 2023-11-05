$(document).ready(() => {
    if (selectedTab == "followers") {
        loadFollowers();
    } else {
        loadFollowing();
    }


})

function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, resultData => {
        displayUsers(resultData.followers, $(".resultsContainer"));
    })
}
function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, resultData => {
        displayUsers(resultData.following, $(".resultsContainer"));
    })
}



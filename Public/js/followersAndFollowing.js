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


function displayUsers(results, container) {
    container.html("");

    results.forEach(result => {
        let html = createUserHtml(result, true);
        container.append(html);
    });
    if (results.length == 0) {
        container.append("<span class='noResults'>no results available</span>")
    }
}

function createUserHtml(userData, showFollowButton) {
    let name = userData.firstname + "" + userData.lastname;
    let isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    let text = isFollowing ? "Unfollow" : "follow"
    let buttonClass = isFollowing ? "followButton following" : "followButton"

    let followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePicture}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}
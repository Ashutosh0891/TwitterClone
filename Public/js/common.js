let cropper;

$(document).ready(function () {
    $("#postTextArea,#replyTextArea").keyup(function (e) {
        let textBox = $(e.target);
        let value = textBox.val().trim();

        let isModal = textBox.parents(".modal").length == 1;
        console.log(isModal)
        let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");
        console.log(submitButton)
        console.log(submitButton.length)

        if (submitButton.length === 0) {
            return alert("no submit button found");
        }
        if (value === "") {
            submitButton.prop("disabled", true);
            return;
        }
        submitButton.prop("disabled", false);
    });

    $("#replyModal").on("show.bs.modal", (event) => {
        let button = $(event.relatedTarget);
        let postId = getPostIdFromElement(button);
        $("#submitReplyButton").data("id", postId)

        $.get("/api/posts/" + postId, results => {
            displayPosts(results.postData, $("#originalPostContainer"))
        })
    });

    $("#replyModal").on("hidden.bs.modal", () => {
        $("#originalPostContainer").html("")

    })

    $("#deletePostModal").on("show.bs.modal", (event) => {
        let button = $(event.relatedTarget);
        let postId = getPostIdFromElement(button);
        $("#deletePostButton").data("id", postId)

        $.get("/api/posts/" + postId, results => {
            displayPosts(results.postData, $("#originalPostContainer"))
        })
    });
    $("#deletePostButton").click((event) => {
        let postId = $(event.target).data("id");
        $.ajax({
            url: `/api/posts/${postId}`,
            type: "DELETE",
            success: () => {
                location.reload()
            }
        })

    })
    $("#filePhoto").change(function () {
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let image = document.getElementById("imagePreview");
                image.src = e.target.result;

                if (cropper !== undefined) {
                    cropper.destroy();
                }
                cropper = new Cropper(image, {
                    aspectRatio: 1 / 1,
                    background: false
                });
            }
            reader.readAsDataURL(this.files[0]); // read the file as a data URL
        }
    });
    $("#coverPhoto").change(function () {
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let image = document.getElementById("coverPreview");
                image.src = e.target.result;

                if (cropper !== undefined) {
                    cropper.destroy();
                }
                cropper = new Cropper(image, {
                    aspectRatio: 16 / 9,
                    background: false
                });
            }
            reader.readAsDataURL(this.files[0]); // read the file as a data URL
        }
    });
    $("#imageUploadButton").click(() => {
        let canvas = cropper.getCroppedCanvas();

        if (canvas == null) {
            alert("could not upload the image");
            return;
        }
        canvas.toBlob(blob => {
            let formData = new FormData();
            formData.append('croppedImage', blob);
            $.ajax({
                url: "/api/users/profilePicture",
                type: "POST",
                data: formData,
                contentType: false,
                processData: false,
                success: () => {
                    location.reload()
                }
            })
        })

    })
    $("#coverPhotoButton").click(() => {
        let canvas = cropper.getCroppedCanvas();

        if (canvas == null) {
            alert("could not upload the image");
            return;
        }
        canvas.toBlob(blob => {
            let formData = new FormData();
            formData.append('croppedImage', blob);
            $.ajax({
                url: "/api/users/coverPhoto",
                type: "POST",
                data: formData,
                contentType: false,
                processData: false,
                success: () => {
                    location.reload()
                }
            })
        })

    })


});


$(document).ready(function () {
    $("#submitPostButton,#submitReplyButton").click(function (e) {
        e.preventDefault();
        let button = $(e.target);
        let isModal = button.parents(".modal").length == 1;
        let textBox = isModal ? $("#replyTextArea") : $("#postTextArea");

        let data = {
            content: textBox.val()
        }

        if (isModal) {
            let id = button.data().id;
            if (id == null) {
                return alert("No Post Id Found!");
            }
            data.replyTo = id;
        }
        $.post("/api/posts", data, (postData) => {
            console.log(postData)
            if (postData.replyTo) {
                location.reload();
            } else {

                let html = createPostHtml(postData);
                $(".postsContainer").prepend(html);
                textBox.val("");
                button.prop("disabled", true);
            }
        })
    });

})



$(document).on("click", ".likeButton", (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);
    if (postId === undefined) {
        return;
    }
    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");

            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
            } else {
                button.removeClass("active");
            }
        }
    })

});

$(document).on("click", ".retweetButton", (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);
    if (postId === undefined) {
        return;
    }
    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            console.log(postData)
            button.find("span").text(postData.retweetUsers.length || "");
            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
            } else {
                button.removeClass("active");
            }
        }
    })

})
$(document).on("click", ".post", (event) => {
    let element = $(event.target);
    let postId = getPostIdFromElement(element);
    if (postId !== undefined && !element.is("button")) {
        window.location.href = `/posts/${postId}`
    }
})

$(document).on("click", ".followButton", (event) => {
    let button = $(event.target);
    let userId = button.data().user
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {
            if (xhr.status == 404) {
                alert("user not found");
                return;
            }
            let difference = 1;
            if (data.following && data.following.includes(userId)) {
                button.addClass("following");
                button.text("unfollow");
            } else {
                button.removeClass("following");
                button.text("follow");
                difference = -1;
            }
            let followerLabel = $("#followersValue");
            if (followerLabel.length != 0) {
                let followersText = followerLabel.text();
                followersText = parseInt(followersText);
                followerLabel.text(followersText + difference)
            }


        }
    })

})

function getPostIdFromElement(element) {
    let isRoot = element.hasClass("post");
    let rootElement = isRoot ? element : element.closest(".post");
    let postId = rootElement.data().id;

    if (postId === undefined) {
        return alert("Post id is undefined");
    }
    return postId;
}

function displayPosts(posts, container) {
    container.html("");

    if (!Array.isArray(posts)) {
        posts = [posts];
    }
    posts.forEach(element => {
        let html = createPostHtml(element)
        container.append(html);
    });

    if (posts.length == 0) {
        container.append("<span>no posts available</span>")
    }
}

function createPostHtml(postData, largeFont = false) {
    let postId = postData._id;
    console.log(postId)
    if (postData == null) {
        return alert("post object is null")
    }
    let isRetweet = postData.retweetData !== undefined;
    let retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData

    if (postData.postedBy._id === undefined) {
        return alert("user not populated");
    }

    let displayName = postData.postedBy.firstname + " " + postData.postedBy.lastname;
    let timeStamps = timeDifference(new Date(), new Date(postData.createdAt));

    let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    let retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    let largeFontClass = largeFont ? "largeFont" : ""

    let retweetText = '';
    if (isRetweet) {
        retweetText = `<span><i class="fa-solid fa-retweet"></i>
        Retweeted By<a href='/profile/${retweetedBy}'> @${retweetedBy} </a></span>`
    }
    // console.log(likeButtonActiveClass)
    let replyFlag = "";
    if (postData.replyTo && postData.replyTo._id) {
        if (!postData.replyTo._id) {
            return alert("reply to is not populated");
        }
        else if (!postData.replyTo.postedBy._id) {
            return alert("postedBy is not populated");
        }

        let replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                   </div>`
    }

    let buttons = ""
    if (postData.postedBy._id == userLoggedIn._id) {
        buttons = `<button data-id='${postId}' data-bs-toggle="modal" data-bs-target="#deletePostModal"><i class="fa-solid fa-trash"></i></button>`
    }

    return `<div class='post ${largeFontClass}' data-id='${postId}'>
        <div class='postActionContainer'>
            ${retweetText}
        </div>
        <div class='mainContentContainer'>
            <div class='userImageContainer'>
                <img src='${postData.postedBy.profilePicture}'/>
            </div>
            <div class='postContentContainer'>
                <div class='header'>
                    <a href='/profile/${postData.postedBy.username}' class='displayName '>${displayName}</a>
                    <span class='username'>@${postData.postedBy.username}</span>
                    <span class='date'>${timeStamps}</span>
                    ${buttons}
                </div>
                ${replyFlag}
                <div class='postBody'>
                    <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                    <div class='postButtonContainer'>
                        <button data-bs-toggle="modal" data-bs-target="#replyModal">
                        <i class="fa-regular fa-comment"></i>
                        </button>
                    </div>
                    <div class='postButtonContainer green'>
                        <button class='retweetButton ${retweetButtonActiveClass}'>  
                        <i class="fa-solid fa-retweet"></i>
                        <span>${postData.retweetUsers.length || ""}</span>
                        </button>
                    </div>
                    <div class='postButtonContainer red'>
                        <button class='likeButton ${likeButtonActiveClass}'>
                        <i class="fa-regular fa-heart"></i>
                        <span>${postData.likes.length || ""}</span>
                        </button>
                    </div>
                    
                </div>
            </div>

        </div>
    </div>`
}

function timeDifference(current, previous) {

    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = current - previous;
    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) {
            return ' just now';
        } else {
            return Math.round(elapsed / 1000) + ' seconds ago';
        }
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function displayPostsWithReplies(results, container) {
    container.html("");
    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        let html = createPostHtml(results.replyTo)
        container.append(html);
    }
    let mainPosthtml = createPostHtml(results.postData, true)
    container.append(mainPosthtml);

    results.replies.forEach(element => {
        let html = createPostHtml(element)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span>no posts available</span>")
    }
}

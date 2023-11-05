
$("#searchBox").keydown((event) => {
    clearTimeout(timer);
    let textbox = $(event.target);
    let value = textbox.val();
    let searchType = textbox.data().search;

    timer = setTimeout(() => {
        value = textbox.val().trim();
        console.log(value)

        if (value == "") {
            $(".resultsContainer").html("");
        }
        else {
            search(value, searchType);
        }
    }, 1000)

})

function search(searchTerm, searchType) {
    let url = searchType == "users" ? "/api/users" : "/api/posts"

    $.get(url, { search: searchTerm }, (results) => {
        console.log(results)
        if (searchType == "users") {
            displayUsers(results, $(".resultsContainer"));
        }
        else {
            displayPosts(results, $(".resultsContainer"))
        }

    })
}
const loadCommentsBtn = document.getElementById("comments-btn");
const commentsSection = document.getElementById("comments");
// to save postid to match with comment postid label
const commentsFormElement = document.querySelector(".create-comment-form form");
const commentTitleElement = document.getElementById("title");
const commentTextElement = document.getElementById("text");

async function saveComment(event) {
  event.preventDefault();
  const postId = commentsFormElement.dataset.postid;
  const enteredTitle = commentTitleElement.value;
  const enteredText = commentTextElement.value;

  const comment = {
    title: enteredTitle,
    text: enteredText,
  };
  // by default, fetch sends a GET request
  try {
    const response = await fetch(`/post/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(comment),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      fetchComments();
    } else {
      alert("Could not send comment");
    }
  } catch (error) {
    alert("Could not send request - maybe try again later");
  }
}

async function fetchComments() {
  const postId = loadCommentsBtn.dataset.postid;
  try {
    // By default, fetch sends get route
    const response = await fetch(`/post/${postId}/comments`);

    if (!response.ok) {
      alert("Fetching comments failed");
      return;
    }

    // client-side json function decodes data from json format to js data values
    const comments = await response.json(); // parses the response.body for us

    if (comments && comments.length > 0) {
      const commentsListElement = createCommentsList(comments);

      commentsSection.innerHTML = "";
      commentsSection.appendChild(commentsListElement);
    } else {
      commentsSection.firstElementChild.textContent =
        "We could not find any comments";
    }
  } catch (error) {
    alert("Getting comments failed");
  }
}

function createCommentsList(comments) {
  const commentsListElement = document.createElement("ol");
  for (const comment of comments) {
    const itemElement = document.createElement("li");
    itemElement.innerHTML = `<article class="comment-item">
        <h2>${comment.title}</h2>
        <p>${comment.text}</p>
      </article>`;
    itemElement.style.display = "block";
    commentsListElement.appendChild(itemElement);
  }
  console.log(commentsListElement);
  return commentsListElement;
}

loadCommentsBtn.addEventListener("click", fetchComments);
commentsFormElement.addEventListener("submit", saveComment);

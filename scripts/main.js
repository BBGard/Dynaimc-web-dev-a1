import { Thread } from "./Thread.js";
import { Post } from "./Post.js";

/* --------------------------- Login Variables ------------------------------- */
// For showing user error messages on the login form
const error_message = document.getElementById('error-message');

// An object to hold the current user
let currentUser = {
  username: "",
  name: ""
};

/* --------------------------- Login Functions ------------------------------- */

// Setup the event listener on the submit button of the login form
document.querySelector('form').addEventListener('submit', (event) => {

  console.log(`Trying to login`);
  currentUser.username = document.getElementById('username-field').value;

  if (currentUser.username == null || currentUser.username === undefined) { return; } // If null username, exit.

  // Check if username exists on the server
  fetch(`http://localhost:7777/api/users/${currentUser.username}`)
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        console.log("User not found");
        error_message.classList.remove('hidden');
        error_message.textContent = "We couldn't find that username. Please try again.";

        throw new Error("Error fetching users. Check the address or connection");
      }
      else {
        return response.json();
      }
    })
    .then(data => {
      // Finish setting up the currentUser object
      currentUser.name = data.name;

      // Load the forum!
      console.log("user found");
      console.log("loading forum...");
      setupForum();
    })
    .catch(error => console.log(error));

  event.preventDefault();
}, false);

// Hides login and displays forum page
const setupForum = () => {
  document.getElementById("login-block").classList.add('hidden'); // Hide login form
  document.getElementById("header").classList.remove('hidden');   // Display header and navbar
  document.getElementById("forum-block").classList.remove('hidden');  // Display empty forum block
  document.getElementById("welcome-box").textContent += `${currentUser.username}!`;   // Show logged in username


  fetchThreads(); // Try to fetch forum posts
  //window.setInterval(fetchPosts, 10000);

  document.getElementById('new-thread-butt').addEventListener('click', (event) => {
    console.log("New thread!");
      //TODO create new thread here

  }, false);
};

// Clear any error messages on input field focus
document.getElementById('username-field').addEventListener('focus', (event) => {
  event.preventDefault();
  error_message.classList.add('hidden');
  error_message.textContent = "";
}, false);


/* --------------------------- END Login Functions ------------------------------- */
/* --------------------------- ------------------- ------------------------------- */

/* --------------------------- Forum Variables ------------------------------- */
/*  Declared here for neatness, keeping in mind hoisting will pull them up    */

// Get thread list element from page
const threadList = document.getElementById("thread-list");


/* --------------------------- Forum Functions ------------------------------- */
// Try to fetch threads
const fetchThreads = () => {

  console.log("Fetching threads");
  fetch('http://localhost:7777/api/threads')
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching threads. Check the address or connection.");
      }
      else {
        return response.json();
      }
    })
    .then(data => {
      // // Populate the thread list
      console.log("Populating thread_list");

      data.forEach(thread => {
        // Create a new thread
        let myThread = new Thread(thread.thread_title, thread.icon, thread.user, thread.id);

        //TODO somewhere here? Check for username match and add a delete button
        // Append thread to thread list
        threadList.append(myThread.toDOM());
      });

      // Once populated, setup some click event listeners on each thread title
      setupListeners();
    })
    .catch(error => console.log(error));
};


// Add listeners for thread title clicks
const setupListeners = () => {
  // Create a list of thread titles
  let threadTitles = Array.from(threadList.getElementsByTagName("a"));
  console.log("adding listeners");

  // Add a listener to each thread title
  //TODO maybe add one listener and use bubbling?
  threadTitles.forEach((title, index) => {
    title.addEventListener("click", (event) => {
      event.preventDefault();

      // Hide or show the posts
       let threadElement = threadList.getElementsByTagName('ul')[index];

      if(threadElement.classList.contains('hidden')) {
        threadElement.classList.remove('hidden');
      }
      else {
        threadElement.classList.add('hidden');
      }

      // Fetch the posts from the server
      fetchPostsForThread(index+1, threadElement);

    });
  });
};

// Attempt to fetch posts for thread "id" and append to "threadElement"
const fetchPostsForThread = (id, threadElement) => {
  // Get the thread being referenced
  let myThread = Thread.threadList[id-1];

  console.log(`Fetching posts for thread: ${id}`);
  fetch(`http://localhost:7777/api/threads/${id}/posts`)
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching posts. Check the address or connection.");
      }
      else {
        return response.json();
      }
    })
    .then(data => {
      // Create post, attach to correct thread, hide
      data.forEach(post => {
        // Create a new post
        let myPost = new Post(post.text, post.user, post.name);
        let myPostElement = myPost.toDOM();
        myPostElement.classList.add('post'); // Add some styling

        // Check if the post already exists
        if(myThread.postList.some(p => p.text === myPost.text)) {
          // If post exists, return
          return;
        }
        else {
          // Add the post to the thread
          threadElement.append(myPostElement);
          myThread.postList.push(myPost);
        }
      })
    })
    .then( () => {
      // Add a reply form if, not already added
      if (threadElement.getElementsByTagName('form').length > 0) {
        return;
      }
      else {
        let replyForm = document.createElement('li');
        // Disgusting, please forgive me...
        replyForm.innerHTML = `<form class="reply-form">
        <div class="reply-form-group">
        <label for="reply-text" class="reply-label">Reply to post: </label>
    <input type="text" name="reply-text" class="reply-text-field" required autocomplete="off">
    <input type="submit" class="reply-button" value="Post"/>
    </div>
  </form>`;
        threadElement.append(replyForm);

        replyForm.getElementsByClassName('reply-button')[0].addEventListener('click', (event) => {
          console.log("Post reply!");
            //TODO create new post here
            console.log(event.target);
            //TODO first, check if the textinput is empty -> return

        }, false);
      }
    })
    .catch(error => console.log(error));

};

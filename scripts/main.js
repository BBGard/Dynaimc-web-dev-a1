import { Thread } from "./thread.js";
import { Post } from "./post.js";

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
document.getElementById('login-form').addEventListener('submit', (event) => {

  console.log(`Trying to login`);
  currentUser.username = document.getElementById('username-field').value;

  if (currentUser.username == null || currentUser.username === undefined) { return; } // If null or undefined username, exit.

  // Check if username exists on the server
  fetch(`http://localhost:7777/api/users/`)
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching users. Check the address or connection");
      }
      else {
        return response.json();
      }
    })
    .then(data => {

      // Iterate over data and look for matching username
      for (let i = 0; i < data.length; i++) {
        if (data[i].username === currentUser.username) {
          // Finish setting up our currentUSer object
          currentUser.name = data[i].name;

          // Load the forum!
          console.log("user found...loading forum...");
          setupForum();
          break;
        }

        // If we reach the end, no user found - show error
        if (i === data.length - 1) {
          console.log("User not found");
          error_message.classList.remove('hidden');
          error_message.textContent = "We couldn't find that username. Please try again.";
        }

      }

    })
    .catch(error => console.log(error));

  event.preventDefault();
}, false);

/* --------------------------- END Login Functions ------------------------------- */
/* --------------------------- ------------------- ------------------------------- */

/* --------------------------- Forum Variables ------------------------------- */
/*  Declared here for neatness, keeping in mind hoisting will pull them up    */

// Get thread list element from page
const threadList = document.getElementById("thread-list");

// Refresh timer, for refreshing forum posts
let refreshTimer;

// Hides login and displays forum page
const setupForum = () => {
  document.getElementById("login-block").classList.add('hidden'); // Hide login form
  document.getElementById("header").classList.remove('hidden');   // Display header and navbar
  document.getElementById("forum-block").classList.remove('hidden');  // Display empty forum block
  document.getElementById("welcome-box").textContent += `${currentUser.username}!`;   // Show logged in username


  fetchThreads(); // Try to fetch forum threads

  // Add event listener to the 'new thread' button
  document.getElementById('new-thread-butt').addEventListener('click', (event) => {
    event.preventDefault();
    toggleNewThreadForm();

  }, false);

  // Setup listener on "Create Thread" button in new thread form
  document.getElementById('new-thread-form').addEventListener('submit', (event) => {
    event.preventDefault();
    createNewThread();

  }, false);

  // Listener for cancel button in create new thread form
  document.getElementById('cancel-button').addEventListener('click', (event) => {
    event.preventDefault();
    toggleNewThreadForm();
  }, false);

  // Add a click listener to the thread list to catch title clicks
  threadList.addEventListener('click', (event) => {
    event.preventDefault();

    // Check if the click event originated from a thread title element
    if (event.target.classList.contains("thread-title")) {
      console.log("It came from a thread title");
      // Get the index of the clicked thread title
      let index = Array.from(event.target.parentNode.parentNode.children).indexOf(event.target.parentNode);
      console.log(`Index is: ${index}`);
      // Hide or show the posts
      let threadElement = threadList.getElementsByTagName('ul')[index];
      let id = index + 1; // The post id for fetching

      if (threadElement.classList.contains('hidden')) {
        threadElement.classList.remove('hidden');
        console.log("Posts were hidden, showing");

        // Fetch the posts from the server
        fetchPostsForThread(id, threadElement);
        // Trigger 10 second timer to refresh posts
        startRefreshTimer(id, threadElement);
      }
      else {
        threadElement.classList.add('hidden');
        console.log("posts where showing, hiding now");
        // Stop the refresh timer
        stopRefreshTimer();
      }

      // Fetch the posts from the server
      // fetchPostsForThread(id, threadElement);
    }
  }, false);

  // Add some annoying popups to the header links
  document.getElementById('navbar').addEventListener('click', (event) => {
    event.preventDefault();
    // console.log(event.target.tagName);

    // return if not clicking a specific element
    if (event.target.tagName === 'UL') {
      return;
    }

    switch (event.target.textContent) {
      case "Front-end":
      case "The Front-end Forum":
      case "Home":
        window.alert("This link would take you home in a real app!");
        break;
      case "About":
        window.alert("This link would take you to the about page in a real app!");
        break;
      case "Contact":
        window.alert("This link would take you to the contact page in a real app!");
        break;
      default:
        if (event.target.textContent.includes("Welcome")) {
          window.alert("This link would log the user out in a real app!");
        }
        break;
    }

  }, false);
};


// Clear any error messages on input field focus
document.getElementById('username-field').addEventListener('focus', (event) => {
  event.preventDefault();
  error_message.classList.add('hidden');
  error_message.textContent = "";
}, false);





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
      console.log(data);
      data.forEach(thread => {

        //TODO somewhere here? Check for username match and add a delete button

        // Check if the thread already exists
        if (Array.from(threadList.children).some(
          elem => elem.querySelector('.thread-title').textContent
            === thread.thread_title)) {
          // If thread exists, return
          console.log("Thread exists already");
          return;
        }
        else {
          // Create a new thread
          let myThread = new Thread(thread.thread_title, thread.icon, thread.user, thread.id);

          // Append thread to thread list
          threadList.append(myThread.toDOM());
        }

      });
    })
    .catch(error => console.log(error));
};

const fetchPostsForThread = (id, threadElement) => {
  // Get the thread being referenced
  let myThread = Thread.threadList[id - 1];

  console.log(`Fetching posts for thread: ${id}`);

  fetchPosts(id)
    .then(data => {
      // Create post, attach to correct thread, hide
      console.log("got posts");
      // console.log(data);
      data.forEach(post => {
        // Check if the post already exists
        const postList = document.querySelectorAll('.post-content');
        // console.log("postList");
        // console.log(postList);

        if (Array.from(postList).some(elem => elem.textContent
            === post.text)) { // TODO And check name?
          // If post exists, return
          // console.log("Post exists already");
          return;
        }
        else {
          // Create a new post
          let myPost = new Post(post.text, post.user, post.name);
          let myPostElement = myPost.toDOM();
          myPostElement.classList.add('post'); // Add some styling

          // Add the post to the thread
          const formElement = threadElement.querySelector('reply-form');
          console.log("Debugs");
          console.log("Form element");
          console.log(formElement);
          console.log("threadElement");
          console.log(threadElement);

          if (formElement) {
            // If the reply form is there, append above it
            console.log("form");
            threadElement.insertBefore(myPostElement, formElement);
          }
          else {
            // Otherwise chuck it on the end
            console.log("no form");
            threadElement.append(myPostElement);
          }

          myThread.postList.push(myPost);
        }
      })
    })
    .then(() => {
      // Add a reply form if, not already added
      console.log("adding reply");
      addReplyFormIfNeeded(threadElement, id);
    })
    .catch(error => console.log(error));

};

// Checks if reply form exists, adds one if not
const addReplyFormIfNeeded = (threadElement, id) => {
  //TODO Fix this shit! Not detecting reply form
  if (threadElement.querySelector('reply-form')) {
    return;
  }
  else {

    const replyForm = createReplyFormElement();
    threadElement.append(replyForm);

    // Add click listener to the reply button
    const replyButton = replyForm.querySelector('.reply-button');

    replyButton.addEventListener('click', (event) => {
      event.preventDefault();
      // Get the value of the input box
      const input = replyForm.getElementsByClassName("reply-text-field");

      // return if empty
      if (input[0].value.length == 0) {
        return;
      }
      else {
        console.log("Post reply!");
        // Create a new post
        const post = new Post(input[0].value, currentUser.username, currentUser.name);

        // Clear the input
        input[0].value = "";

        // Try to post it
        submitNewPost(post, id, threadElement);
      }
    }, false);
  }
};

// Creates a reply form to attach to a post
const createReplyFormElement = () => {
  // Form
  const form = document.createElement('form');
  form.classList.add('reply-form');

  // Form group
  const formGroup = document.createElement('div');
  formGroup.classList.add('reply-form-group');
  form.append(formGroup);

  // Label
  const label = document.createElement('label');
  label.classList.add('reply-label');
  label.textContent = "Reply to post:";
  formGroup.append(label);

  // Text input field
  const textField = document.createElement('input');
  textField.type = 'text';
  textField.name = 'reply-text';
  textField.classList.add('reply-text-field');
  textField.required = true;
  textField.autocomplete = 'off';
  formGroup.append(textField);

  // Reply button
  const button = document.createElement('input');
  button.type = 'submit';
  button.classList.add('reply-button');
  button.value = "Post";
  formGroup.append(button);

  return form;
};

// Fetches posts for a specified thread id
const fetchPosts = (id) => {
  return fetch(`http://localhost:7777/api/threads/${id}/posts`)
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching posts. Check the address or connection.");
      }
      else {
        return response.json();
      }
    });
}


// Attempts to POST a new post to the correct thread
const submitNewPost = (post, id, threadElement) => {

  fetch(`http://localhost:7777/api/threads/${id}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: post.stringify()
  })
    .then(response => response.json())
    .then(() => {
      console.log("refresh posts");
      fetchPostsForThread(id, threadElement);
    })
    .catch(error => console.log(error));
};

// Starts the refresh timer, fetches posts for id every 10 seconds
const startRefreshTimer = (id, threadElement) => {
  refreshTimer = setTimeout(() => {
    // console.log("start timer");
    // Fetch posts
    fetchPostsForThread(id, threadElement);

    // Call self every 10 seconds
    startRefreshTimer(id, threadElement);
  }, 10000);
};

// Stops the refresh timer
const stopRefreshTimer = () => {
  // console.log("Stopping timer");
  clearTimeout(refreshTimer);
};

// Simply toggles the new thread form to show or hide
const toggleNewThreadForm = () => {
  console.log("toggle form");
  if (document.getElementById('new-thread-block').classList.contains('hidden')) {
    document.getElementById("forum-block").classList.add('hidden');
    document.getElementById("new-thread-block").classList.remove('hidden');
  }
  else {
    document.getElementById("forum-block").classList.remove('hidden');
    document.getElementById("new-thread-block").classList.add('hidden');
  }
};

// Creates a new thread using the new thread form
const createNewThread = () => {

  // Setup
  const title = document.getElementById('thread-title-field').value;
  const icon = '\u{1F600}'; // Same icon for everyone, being lazy here... maybe add it as a bonus challenge!
  const id = Thread.threadList.length + 1; // Get the number of current threads, add 1

  const myNewThread = new Thread(title, icon, currentUser.username, id);

  //Create the post within the thread
  const postText = document.getElementById('thread-text-field').value;

  const myNewPost = new Post(postText, currentUser.username, currentUser.name);

  // Add post to the thread
  myNewThread.addPost(myNewPost);

  // POST the new thread
  postNewThread(id, myNewThread);

  // Clear form fields
  document.getElementById('thread-title-field').value = "";
  document.getElementById('thread-text-field').value = "";
}

const postNewThread = (id, thread) => {
  console.log("Posting new thread");

  fetch(`http://localhost:7777/api/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: thread.stringifyLatest()
  })
    .then(response => response.json())
    .then(() => {
      // TODO refresh the thread list
      console.log("refresh thread list");
      fetchThreads();
    })
    .catch(error => console.log(error));

  // Show the forum, hide the form
  toggleNewThreadForm();

};

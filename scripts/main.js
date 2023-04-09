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
    createNewThreadFromForm();

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
       //TODO See if any other threads are open and close them
       // There is a memory leak here when multiple threads are opened
       // Too many timers can be created and not properly destroyed

      // Get the index of the clicked thread title
      let index = Array.from(event.target.parentNode.parentNode.children).indexOf(event.target.parentNode);
      // Hide or show the posts
      // let threadElement = threadList.getElementsByTagName('ul')[index];
      let id = index + 1; // The post id for fetching

      // Get the ul holding the posts
      const postListElement = event.target.parentNode.querySelector('ul');

      if (postListElement.classList.contains('hidden')) {
        postListElement.classList.remove('hidden');
        console.log("Posts were hidden, showing");

        // Trigger 10 second timer to refresh posts
        startRefreshTimer(id);
        //TODO re enable this
      }
      else {
        postListElement.classList.add('hidden');
        console.log("posts where showing, hiding now");
        // Stop the refresh timer
        stopRefreshTimer();
      }
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

      data.forEach(thread => {
        const uList = Array.from(threadList.children);

        if( uList.length === data.length) {
          console.log("Length match");
          return;
        }
        else {
          // Create a new thread
          const myThread = new Thread(thread.thread_title, thread.icon, thread.user, thread.id);

          // Append thread to thread list
          const threadElement = myThread.toDOM();
          threadElement.setAttribute('id', `thread-${thread.id}`);
          threadList.append(threadElement);

          // Fetch the posts
          fetchPostsForThread(myThread.id);
        }

      });
    })
    .catch(error => console.log(error));
};

// Fetches all of the posts for a particular thread
const fetchPostsForThread = (id) => {
  // Get a list of current posts in the thread
  // const currentPostList = Array.from(myThread.postList);
  // console.log("currentPostLis");
  // console.log(currentPostList);

  const myThread = Thread.threadList[id-1];
  const currentPostList = Array.from(myThread.postList);

  console.log(`Fetching posts for thread: ${id}`);

  // Fetch
  fetchPosts(id)
    .then(data => {
      console.log(`Got ${data.length} posts`);

      let index = 0;

      // Check if that post is already shown in the forum, if not add it
      data.forEach(post => {
        index++;
        const myPost = new Post(post.text, post.user, post.name);

        // Check if myPost is already in currentPostList
        const postExists = currentPostList.some((post) => {
          return post.text === myPost.text && post.user === myPost.user
          && post.name === myPost.name;
        });

        // This is a hack that allows posting the same message, dirty but it works
        const sameButDifferent = myThread.postList.length < data.length
          && myThread.postList.length < index;

        // If the post is already shown, return
        if (postExists && !sameButDifferent) {
          console.log("post exists");
          return;
        }
        else {
          // Add it to the DOM
          const myPostElement = myPost.toDOM();
          myPostElement.classList.add('post'); // Add some styling

          // Check if we have a form element
          const formElement = document.querySelector(`#thread-${id} .reply-form`);

          if (formElement) {
            // If the reply form is there, append post above it
            console.log("form");
            formElement.insertAdjacentElement('beforebegin', myPostElement);
          }
          else {
            // Otherwise chuck it on the end
            console.log("no form");
            const threadElement = document.querySelector(`#thread-${id}`).querySelector('ul');
            threadElement.append(myPostElement);
          }

          // Add post to the threads postList
          myThread.postList.push(myPost);
        }
      })
    })
    .then(() => {
      // Add a reply form if, not already added
      // Called here so we only add it once
      console.log("adding reply");
      addReplyFormIfNeeded(myThread.id);
    })
    .catch(error => console.log(error));

};

// Checks if reply form exists, adds one if not
const addReplyFormIfNeeded = (id) => {
  const threadElement = document.querySelector(`#thread-${id}`).querySelector('ul');

  if (threadElement.querySelector('.reply-form')) {
    // Form exists
    return;
  }
  else {
    // Create the form and add it to the post
    const replyForm = createReplyFormElement(id);
    threadElement.append(replyForm);

    // Add click listener to the reply button and delete button
    const replyButton = replyForm.querySelector('.reply-button');
    const deleteButton = replyForm.querySelector('.delete-button');

    // Reply
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
        submitNewPost(post, id);
      }
    }, false);

    // Delete Thread
    if(deleteButton != null) {
      deleteButton.addEventListener('click', (event) => {
        event.preventDefault();

        deleteThread(id);
      });
    }

  }
};

// Creates a reply form to attach to a post
const createReplyFormElement = (id) => {
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

  // Check if the current user is the thread creator
  // Add delete button if so
  // Get the thread being referenced
  const myThread = Thread.threadList[id - 1];

  if(myThread.user === currentUser.username) {
    const deleteButton = document.createElement('input');
    deleteButton.type = 'button';
    deleteButton.classList.add('delete-button');
    deleteButton.value = "Delete Thread";
    formGroup.append(deleteButton);
  }

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
const submitNewPost = (post, id) => {

  fetch(`http://localhost:7777/api/threads/${id}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: post.stringify()
  })
    .then(response => response.json())
    .then(() => {
      console.log("refresh posts");
      fetchPostsForThread(id);
    })
    .catch(error => console.log(error));
};

// Starts the refresh timer, fetches posts for id every 10 seconds
const startRefreshTimer = (id) => {
  refreshTimer = setTimeout(() => {
    // console.log("start timer");
    // Fetch posts
    fetchPostsForThread(id);

    // Call self every 10 seconds
    startRefreshTimer(id);
  }, 10000);
};

// Stops the refresh timer
const stopRefreshTimer = () => {
  console.log("Stopping timer");
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
const createNewThreadFromForm = () => {

  // Setup
  const title = document.getElementById('thread-title-field').value;
  const icon = '\u{1F600}'; // Same icon for everyone, being lazy here... maybe add it as a bonus challenge!
  const id = Thread.threadList.length + 1; // Get the number of current threads, add 1

  const myNewThread = new Thread(title, icon, currentUser.username, id);

  //Create the post within the thread
  const postText = document.getElementById('thread-text-field').value;

  // POST the new thread
  postNewThread(id, myNewThread, postText);

  // Append thread to thread list
  const threadElement = myNewThread.toDOM();
  threadElement.setAttribute('id', `thread-${id}`);
  threadList.append(threadElement);

  // Clear form fields
  document.getElementById('thread-title-field').value = "";
  document.getElementById('thread-text-field').value = "";
}

const postNewThread = (id, thread, firstPost) => {
  console.log("Posting new thread");

  fetch(`http://localhost:7777/api/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      {
        user: thread.user,
        thread_title: thread.thread_title,
        icon: thread.icon,
        text: firstPost
      })
  })
    .then(response => response.json())
    .then(() => {
      console.log("refresh thread list");
      fetchPostsForThread(id);
    })
    .catch(error => console.log(error));

  // Show the forum, hide the form
  toggleNewThreadForm();
};

// Deletes a forum thread
const deleteThread = (id) => {
  console.log(`Deleting thread at id ${id}`);

  fetch(`http://localhost:7777/api/threads/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: currentUser.username
    })
  })
    .then(response => {
      if (response.ok) {
        console.log('Post deleted successfully');
        //Remove from DOM
        const threadElement = document.querySelector(`#thread-${id}`).querySelector('ul');
        threadElement.parentNode.remove(threadElement);
        // Stop refresh timer
        stopRefreshTimer();
      } else {
        console.error('Error deleting post');
      }
    })
    .catch(error => console.log(error));
};

import { Thread } from "./thread.js";
import { Post } from "./post.js";
import { currentUser } from "./login.js";

/***
 * This script controls the forum functionality
 * Author: Benjamin Gardiner
 */

// Get thread list 'ul' element from page - for appending threads
const threadList = document.getElementById("thread-list");

// Object to store active refresh timers - for refreshing posts
let refreshTimers = {};

// State object holding the current state of the forum - array of Thread objects, maxId to track thread ids
const state = {
  threads: [],
  maxId: 0
};

/**
 * setupForum
 * Hides login, displays forum page, sets up listeners, fetches threads
 */
export const setupForum = () => {
  document.getElementById("login-block").classList.add('hidden'); // Hide login form
  document.getElementById("header").classList.remove('hidden');   // Display header and navbar
  document.getElementById("forum-block").classList.remove('hidden');  // Display the empty forum block
  document.getElementById("welcome-text").textContent += `${currentUser.username}!`;   // Show logged in username

  // Hamburger menu functionality
  document.querySelector('.burger').addEventListener('click', (event) => {
    event.preventDefault();
    if (document.querySelector('.menu').classList.contains('responsive')) {
      document.querySelector('.menu').classList.remove('responsive');
    }
    else {
      document.querySelector('.menu').classList.add('responsive');
    }
  })

  // Add event listener to the 'new thread' button
  document.getElementById('new-thread-butt').addEventListener('click', (event) => {
    event.preventDefault();
    toggleNewThreadForm();

  }, false);

  //Listener for "Create Thread" button in new thread form
  document.getElementById('new-thread-form').addEventListener('submit', (event) => {
    event.preventDefault();
    createNewThreadFromForm();

  }, false);

  // Listener for cancel button in create new thread form
  document.getElementById('cancel-button').addEventListener('click', (event) => {
    event.preventDefault();
    toggleNewThreadForm();
  }, false);

  // Listener to catch thread title clicks
  threadList.addEventListener('click', (event) => {
    event.preventDefault();
    handleTitleClick(event.target);
  }, false);

  // Add some annoying popups to the header links
  document.getElementById('navbar').addEventListener('click', (event) => {
    event.preventDefault();

    // return if not clicking a specific element
    if (event.target.tagName === 'UL') {
      return;
    }

    // Figure out what was clicked, display annoying message...sorry
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
      case "Logout":
        window.alert("This link would log the user out in a real app!");
        break;
      default:
        if (event.target.id === "welcome-text") {
          window.alert("This link would open the profile page in a real app!");
        }
        break;
    }

  }, false);

  // Finally, fetch the threads...the magic begins
  fetchThreads()
    .then(data => {
      data.forEach(thread => {
        createThreadAndAddToDOM(thread);  // Add threads to page
      })
    })
    .catch(error => console.log(error));

};

/**
 * Fetches threads from the API - Note: hardcoded API used here, change to make code reuseable
 * @returns Promise that should resolve to JSON data representing threads
 */
const fetchThreads = () => {
  return fetch('http://localhost:7777/api/threads')
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching threads. Check the address or connection.");
      }
      else {
        return response.json();
      }
    })
};

/**
 * Fetches posts for a given thread 'id'
 * @id the id of the thread to fetch posts for
 * @returns Promise that should resolve to JSON data representing the posts for a given thread
 */
const fetchPostsForThread = (id) => {
  return fetch(`http://localhost:7777/api/threads/${id}/posts`)
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching posts. Check the address or connection.");
      }
      else {
        return response.json();
      }
    })
};

/**
 * Creates a new Thread object, adds it to the DOM
 * @param thread object representing the thread data
 */
const createThreadAndAddToDOM = (thread) => {

  // Create a new thread
  const newThread = new Thread(thread.thread_title, thread.icon, thread.user, thread.id);

  // Update the state
  state.threads[thread.id] = newThread;

  // Append thread to thread list
  const threadElement = newThread.toDOM();
  threadElement.setAttribute('id', `thread-${newThread.id}`); // Set id
  threadList.append(threadElement);

  // Update the maxId
  state.maxId = thread.id > state.maxId ? thread.id : state.maxId;

  // Fetch the posts for the new thread and add them to the thread's postList
  fetchPostsForThread(newThread.id)
    .then(postData => {
      postData.forEach(post => {
        createPostAndAddToDOM(post, newThread);
      });
    })
    .then(() => {
      // Add a reply form if, not already added
      // Called here so we only add it once
      addReplyFormIfNeeded(newThread.id);
    })
    .catch(error => console.log(error));
};

/**
 * Creates a new Post, adds it to the DOM
 * @param post object representing the post data
 * @param thread reference to the parent thread of the post
 */
const createPostAndAddToDOM = (post, thread) => {
  const myPost = new Post(post.text, post.user, post.name);
  // Add it to the DOM
  const myPostElement = myPost.toDOM();
  myPostElement.classList.add('post'); // Add some styling

  // Check if we have a form element on the thread
  const formElement = document.querySelector(`#thread-${thread.id} .reply-form`);

  if (formElement) {
    // If the reply form is there, append post above it
    formElement.insertAdjacentElement('beforebegin', myPostElement);
  }
  else {
    // Otherwise append post to the end of the list
    const postListElement = document.querySelector(`#thread-${thread.id}`).querySelector('ul');
    postListElement.append(myPostElement);
  }

  // Add the new Post to the Threads postList array
  thread.addPost(myPost);
};


/**
 * Checks if reply form exists on a thread, adds one if not
 * @param id the id of the thread
 */
const addReplyFormIfNeeded = (id) => {
  // Get the thread element
  const threadElement = document.querySelector(`#thread-${id}`).querySelector('ul');

  // Check if form exists
  if (threadElement.querySelector('.reply-form')) {
    // Form exists
    return;
  }
  else {
    // Create the form and add it to the end of the thread
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
        // Create a new post
        const post = new Post(input[0].value, currentUser.username, currentUser.name);

        // Clear the input
        input[0].value = "";

        // Try to post it
        postNewPost(post, id);
      }
    }, false);

    // Delete Thread
    if (deleteButton != null) {
      deleteButton.addEventListener('click', (event) => {
        event.preventDefault();

        deleteThread(id);
      });
    }

  }
};

/**
 * Creates a reply form to attach to a thread
 * @param id the id of the thread to attach the form to
 * @returns a html form element
 */
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
  // If so, add delete button
  // Get the thread being referenced
  const myThread = Thread.threadList.find(thread => thread.id === id);

  if (myThread.user === currentUser.username) {
    const deleteButton = document.createElement('input');
    deleteButton.type = 'button';
    deleteButton.classList.add('delete-button');
    deleteButton.value = "Delete Thread";
    formGroup.append(deleteButton);
  }

  return form;
};

/**
 * Creates a new thread using the fields from new-thread-form
 */
const createNewThreadFromForm = () => {

  // Get thread elements
  const title = document.getElementById('thread-title-field').value;
  const icon = '\u{1F600}'; // Same icon for everyone, being lazy here... maybe add it as a bonus challenge!
  const postText = document.getElementById('thread-text-field').value;

  // POST the new thread
  postNewThread(currentUser.username, title, icon, postText);

  // Clear form fields
  document.getElementById('thread-title-field').value = "";
  document.getElementById('thread-text-field').value = "";
}


/**
 * Simply toggles the new thread form to show or hide
 */
const toggleNewThreadForm = () => {
  if (document.getElementById('new-thread-block').classList.contains('hidden')) {
    document.getElementById("forum-block").classList.add('hidden');
    document.getElementById("new-thread-block").classList.remove('hidden');
  }
  else {
    document.getElementById("forum-block").classList.remove('hidden');
    document.getElementById("new-thread-block").classList.add('hidden');
  }
};

/**
 * Attempts to POST a new post to the correct thread
 * @param post the Post object
 * @param id the thread to POST the Post to
 */
const postNewPost = (post, id) => {

  // POST post
  fetch(`http://localhost:7777/api/threads/${id}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: post.stringify()
  })
    .then(response => response.json())
    .then(() => {
      refreshPosts(id); // Refresh the posts for the thread
    })
    .catch(error => console.log(error));
};

/**
 * Attempts to POST a new thread to the server
 * Called from the newThreadForm
 * NOTE: the actual Thread object has not been created yet, that will
 * be done after 'refreshing' the threads -       refreshThreads();
 * @param user the current loggin in user
 * @param title the title of the new thread
 * @param icon the icon for the thread - default smiley
 * @param text the text of the first post in the new thread
 */
const postNewThread = (user, title, icon, text) => {

  // POST thread
  fetch(`http://localhost:7777/api/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      {
        user: user,
        thread_title: title,
        icon: icon,
        text: text
      })
  })
    .then(response => response.json())
    .then(() => {
      refreshThreads(); // refresh thread list
    })
    .catch(error => console.log(error));

  // Show the forum, hide the form
  toggleNewThreadForm();
};

/**
 * Deletes a forum thread from the server and updates the state
 * @param id id of the thread to delete
 */
const deleteThread = (id) => {

  // DELETE thread from server
  fetch(`http://localhost:7777/api/threads/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: currentUser.username
    })
  })
    .then(response => {
      if (response.ok) {
        //Remove from DOM
        const threadElement = document.querySelector(`#thread-${id}`).querySelector('ul');
        threadElement.parentNode.remove(threadElement);

        // Remove from local state
        // Create a new array of threads that excludes the thread with the matching ID
        const updatedThreads = state.threads.filter(thread => thread.id !== id);
        state.threads = updatedThreads;

        // Stop refresh timer for the deleted thread
        stopRefreshTimer(id);
      } else {
        console.error('Error deleting thread');
      }
    })
    .catch(error => console.log(error));
};

/**
 * Gets the id attribute of the clicked thread, shows/hides the posts,
 * stops/starts the refresh timer
 * @param target the thread title taht was clicked
 */
const handleTitleClick = (target) => {

  // Check if the click event originated from a thread title element
  if (target.classList.contains("thread-title")) {

    // Get the thread id
    const elementId = target.parentNode.getAttribute('id');
    const id = parseInt(elementId.split("-")[1]);

    // Get the ul holding the posts
    const postListElement = target.parentNode.querySelector('ul');

    // If posts were hidden, show them
    if (postListElement.classList.contains('hidden')) {
      postListElement.classList.remove('hidden');

      // Trigger 10 second timer to refresh posts
      startRefreshTimer(id);
    }
    else {
      // Hide the posts
      postListElement.classList.add('hidden');
      // Stop the refresh timer
      stopRefreshTimer(id);
    }
  }
};

/**
 * Starts a refresh timer for a thread at given id
 * Fetches posts for thread id every 10 seconds
 * @param id the id of the thread to refresh
 */
const startRefreshTimer = (id) => {
  refreshTimers[id] = setInterval(() => {
    refreshPosts(id)
  }, 10000)
};

/**
 * Stops the refresh timer for a given thread id
 * @param id the id of the thread to stop refresshing
 */
const stopRefreshTimer = (id) => {
  clearInterval(refreshTimers[id]);
};

/**
 * Fethces the posts for a given thread from the server
 * Updates the DOM if required - comparing local state to server data
 * This essentially allows for multiple users to be posting at once
 * @param id the id of the thread to fetch posts for
 */
const refreshPosts = (id) => {
  // Get the current thread from state
  const currentThread = state.threads.find(thread => thread && thread.id === id);

  // Fetch the posts for the thread from the server
  fetchPostsForThread(id)
    .then(data => {
      // Compare server data with local data
      data.forEach((post, index) => {
        const localPost = currentThread.postList[index];

        // If there is a local post AND it matches the server post, do nothing
        if (localPost && post.text === localPost.text) {
          return;
        }
        else {
          // If a post is found on the server and NOT locally,
          // create a new post and add it to DOM
          createPostAndAddToDOM(post, currentThread);
        }
      })
    });
};

/**
 * Fetches the threads from the server
 * Updates the DOM if required - comparing local state to server data
 */
const refreshThreads = () => {
  // Fetch threads from the server
  fetchThreads()
    .then(data => {
      data.forEach((thread) => {
        // If there is a local thread AND it matches the server thread, do nothing
        if (state.threads.some(localThread => localThread.id === thread.id)) {
          return;
        }
        else {
          // If a thread is found on the server and NOT locally,
          // create a new thread and add it to DOM
          createThreadAndAddToDOM(thread);
        }
      })
    });
};

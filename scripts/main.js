import { Thread } from "./Thread.js";
import { Post } from "./Post.js";

/* --------------------------- Login Variables ------------------------------- */
// For showing user error messages on the login form
const error_message = document.getElementById('error-message');

// The entered username from the login form
let current_user = "";

/* --------------------------- Login Functions ------------------------------- */

// Setup the event listener on the submit button of the login form
document.querySelector('form').addEventListener('submit', (event) => {

  console.log(`Trying to login`);
  current_user = document.getElementById('username-field').value;

  if (current_user == null || current_user === undefined) { return; } // If null username, exit.

  // Check if username exists on the server
  fetch(`http://localhost:7777/api/users/${current_user}`)
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        console.log("User not found");
        error_message.classList.remove('hidden');
        error_message.textContent = "We couldn't find that username. Please try again.";

        throw new Error("Error fetching users. Check the address or connection");
      }
      else {
        // Load the forum!
        console.log("user found");
        console.log("loading forum...");
        setupForum();
      }
    })
    .catch(error => console.log(error));

  event.preventDefault();
}, false);

// Hides login and displays forum page
const setupForum = () => {
  document.getElementById("login-block").classList.add('hidden'); // Hide login form
  document.getElementById("header").classList.remove('hidden');   // Display header and navbar
  document.getElementById("forum-block").classList.remove('hidden');  // Display empty forum block
  document.getElementById("welcome-box").textContent += `${current_user}!`;   // Show logged in username

  fetchThreads(); // Try to fetch forum posts
  //window.setInterval(fetchPosts, 10000);
}

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
    .then(jsonData => populateThreadList(jsonData))
    .catch(error => console.log(error));
}

// Populate the thread list with the fetched posts
const populateThreadList = (data) => {
  console.log("Populating thread_list");

  data.forEach(thread => {
    // Create a new thread
    let myThread = new Thread(thread.thread_title, thread.icon, thread.user, thread.id);

    // Append thread to thread list
    threadList.append(myThread.toDOM());

    // Get thread elements (to append posts to)
    let threadElements = threadList.getElementsByTagName('ul');

    // Fetch the posts for that thread
    fetchPostsForThread(myThread, threadElements);
  });

  // Once populated, setup some click event listeners on each thread title
  setupListeners();

}

// Try to fetch the posts for a particular thread
const fetchPostsForThread = (myThread, threadElements) => {
  console.log(`Fetching posts for thread ${myThread.id}`);
    fetch(`http://localhost:7777/api/threads/${myThread.id}/posts`)
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
          // myPostElement.classList.add('hidden'); // Hide the posts for now

          // Append the post to the correct thread element
          threadElements[myThread.id-1].append(myPostElement);
          threadElements[myThread.id-1].classList.add('hidden'); // Hide the posts for now


          // Add the post to the threads postList
          myThread.postList.push(myPost);
        })
      })
      .catch(error => console.log(error));
}

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
      // console.log(`You clicked item: ${index}`);

      // Hide or show the posts
      let threadElements = threadList.getElementsByTagName('ul')[index];

      if(threadElements.classList.contains('hidden')) {
        threadElements.classList.remove('hidden');
      }
      else {
        threadElements.classList.add('hidden');
      }

    });
  });
}


const showPost = (data, element) => {
  console.log("Element");

  // if(threadTitles === undefined) return;
  console.log(element);

  //TODO Prevent adding already shown content
  // maybe wipe and start fresh?

  //TODO Close the thread on click

  // data.forEach(post => {
  //   let myPost = new Post(post.text, post.user, post.name);
  //   element.append(myPost.toDOM());

  // })

  for (let i=0; i<data.length; i++ ) {
    console.log("data");
    console.log(data);
    console.log(`data[i]: ${data[i]}`);
    console.log(`data[i].text: ${data[i].text}`);

    if(data[i].text === Thread.threadList[i].text) {
      console.log("Found the same thread!");
    }
    else {
      let myPost = new Post(data[i].text, data[i].user, data[i].name);
      element.append(myPost.toDOM());
    }
  }

}

// document.getElementById("thread-list").addEventListener('click', (event) => {
//   event.preventDefault();
//   event.stopPropagation();
//   console.log("thread clicked!");
//   console.log(`element was ${event.target.textContent}`);

//   let title = event.target.textContent;

//   console.log("fetching post content");

//   fetch('http://localhost:7777/api/threads')
//     .then(response => {
//       if (!response.ok) {
//         // Catches any http 4xx or 5xx errors
//         throw new Error("Error fetching threads. Check the address or connection.");
//       }
//       else {
//         return response.json();
//       }
//     })
//     .then(jsonData => {
//       for(let element of jsonData) {
//         if (element.thread_title === title) {
//           console.log("Found a match");
//           // TODO: Setup the post content
//           // TODO: match id instead of title?
//         }
//       }
//     })
//     .catch(error => console.log(error));


// })

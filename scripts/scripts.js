/**
* This script verifies a username before allowing user into (building) forum
 */

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

  // Check if username exists
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
function setupForum() {
  document.getElementById("login-block").classList.add('hidden'); // Hide login form
  document.getElementById("header").classList.remove('hidden');   // Display header and navbar
  document.getElementById("forum-block").classList.remove('hidden');  // Display empty forum block
  document.getElementById("welcome-box").textContent += `${current_user}!`;   // Show logged in username

  fetchThreadTitles(); // Try to fetch forum posts
  //window.setInterval(fetchPosts, 10000);
}

// Clear error message on input field focus
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
const thread_list = document.getElementById("thread-list");
let threadTitles = [];  // An array for storing thread title links

// Store threads in a local object
let thread_object;


/* --------------------------- Forum Functions ------------------------------- */
// Try to fetch posts
function fetchThreadTitles() {

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
function populateThreadList(data) {
  console.log("Populating thread_list");

  // TODO: Set id on post equal to id in API
  data.forEach (item => {
    // Setup thread title
    let title = document.createElement('a');
    title.append(`${item.icon} | `, item.thread_title);
    title.href = `http://localhost:4507/?id=${item.id}`

    let author = document.createElement('p');
    author.append(item.user)

    let li = document.createElement('li');
    li.append(title, author);
    thread_list.append(li);

  })
  // Once populated, setup some click event listeners
  setupListeners();

}

// Add listeners for link clicks
// TODO reafactor to one listener
function setupListeners() {
  threadTitles = Array.from(thread_list.getElementsByTagName("li"));

  // Add listener for each thread title
  threadTitles.forEach((title, index) => {
    title.addEventListener("click", (event) => {
      event.preventDefault();
      console.log(`You clicked item: ${index}`);

      // Load and display posts.
      fetchPostData(index);
    });
  });
}

function fetchPostData(index) {
  console.log("Fetching posts");
  fetch(`http://localhost:7777/api/threads/${index + 1}/posts`)
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching posts. Check the address or connection.");
      }
      else {
        return response.json();
      }
    })
    .then(jsonData => populatePostList(jsonData, index))
    .catch(error => console.log(error));
}


const populatePostList = (data, index) => {

  if(threadTitles === undefined) return;

  //TODO Prevent adding already shown content
  // maybe wipe and start fresh?
  // let children = threadTitles[index].querySelectorAll('p');
  // for(let i=0; i<children.length; i++) {
  //   threadTitles[index].remove(i+1);
  // }
  // use dataset
  // post.dataset.postId=index

  //TODO Close the thread on click
  for(let i=0; i<data.length; i++) {
    let postText = document.createElement('p');
    let postAuthor = document.createElement('p');

    postAuthor = data[i].name;
    postText = data[i].text;

    threadTitles[index].append(postText);
    threadTitles[index].append(postAuthor);
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
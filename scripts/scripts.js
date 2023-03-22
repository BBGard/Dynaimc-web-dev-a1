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

  event.preventDefault(); // Prevent default action
}, false);

// Hides login and displays forum page
function setupForum() {
  document.getElementById("login-block").classList.add('hidden'); // Hide login form
  document.getElementById("header").classList.remove('hidden');   // Display header and navbar
  document.getElementById("forum-block").classList.remove('hidden');  // Display empty forum block
  document.getElementById("welcome-box").textContent += `${current_user}!`;   // Show logged in username

  fetchPosts(); // Try to fetch forum posts
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

// Store threads in a local object
let thread_object;


/* --------------------------- Forum Functions ------------------------------- */
// Try Fetch posts
function fetchPosts() {
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
  // console.log(data);
  //console.log(`Last timestamp: ${last_update}, current timestamp: ${data.createdAt}`);

  if(thread_object === null || thread_object === undefined) {
    console.log("Empty object");
  }

  for (let element of data) {
    let li = document.createElement('li')   // Create list element to hold title of post
    let link = document.createElement('a'); // Create an anchor element - for later
    link.href = '#';                        // Empty link, for now
    link.append(element.thread_title);
    li.append(link);
    thread_list.append(li);                 // Add the new post title to the thread_list
  }
}
// Add listener for link clicks
// Bubble, check which link it came from, get title, get data, populate forum

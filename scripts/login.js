import { setupForum } from "./main.js";

/***
 * This script controls the login functionality
 * Takes the username value from the login form, fetches users from the server,
 * looks for a matching username in the data.
 * Author: Benjamin Gardiner
 */

// Get error message element
const error_message = document.getElementById('error-message');

// Create user object
export const currentUser = {
  username: "",
  name: ""
};

// Setup an event listener on the submit button of the login form
document.getElementById('login-form').addEventListener('submit', (event) => {

  // Set username of the currentUser to the value from username-field
  currentUser.username = document.getElementById('username-field').value;

  // If value is null or undefined, return
  if (currentUser.username == null || currentUser.username === undefined) { return; } // If null or undefined username, exit.

  // Check if username exists on the server  by fetching the list of users and comparing
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

      // Iterate over user data and look for matching username
      for (let i = 0; i < data.length; i++) {
        if (data[i].username === currentUser.username) {
          // If match is found, finish setting up our currentUser object
          currentUser.name = data[i].name;

          // Load the forum!
          setupForum(); // Head over to the "main.js" script
          break;
        }

        // If we reach the end, no user found - show error
        if (i === data.length - 1) {
          error_message.classList.remove('hidden');
          error_message.textContent = "We couldn't find that username. Please try again.";
        }

      }

    })
    .catch(error => console.log(error));

  event.preventDefault();
}, false);

// Clear any error messages on input field focus
document.getElementById('username-field').addEventListener('focus', (event) => {
  event.preventDefault();
  error_message.classList.add('hidden');
  error_message.textContent = "";
}, false);

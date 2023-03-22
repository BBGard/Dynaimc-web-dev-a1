/**
* This script verifies a username before allowing user into forum
 */


// Setup the event listeners
let my_form = document.querySelector('form');
my_form.addEventListener('submit', attemptLogin, false);

let form_input = document.getElementById('username');
form_input.addEventListener('focus', clearErrorText, false);

let error_message = document.getElementById('error-label');

let entered_username = "";


// Get the value of the username field
function getUsername() {
  return form_input.value;
}

// Clear error message
function clearErrorText(event) {
  event.preventDefault();
  error_message.style.visibility = 'hidden';
}

// Event handler for submit
function attemptLogin(event) {
  event.preventDefault();

  console.log(`Trying to login`);

  fetch('http://localhost:7777/api/users')
    .then(response => response.json())
    .then(jsonData => checkUserName(jsonData))
    .catch(error => console.log(error));
  console.log("Fetching");
}

// Get the list of usernames
function checkUserName(data) {
  entered_username = getUsername();

  console.log("getting user list");
  console.log(data);

  if (entered_username == null) return;

  else {
    for(let i=0; i<data.length; i++) {
      if (data[i].username === entered_username) {
        console.log("We have a winner");
        // Login here
        break;
      }
    }

    // put this somewhere useful
    error_message.style.visibility = 'visible';
  }


  return null;
}

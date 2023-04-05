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
    console.log("New thread!");
    //TODO create new thread here

  }, false);

  // Add some annoying popups to the header links
  document.getElementById('navbar').addEventListener('click', (event) => {
    event.preventDefault();
    console.log(event.target.tagName);

    // return if not clicking a specific element
    if(event.target.tagName === 'UL') {
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
      case "Contact" :
        window.alert("This link would take you to the contact page in a real app!");
        break;
      default:
        if(event.target.textContent.includes("Welcome")) {
          window.alert("This link would log the user out in a real app!");
        }
        break;
    }

  }, false)
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

      if (threadElement.classList.contains('hidden')) {
        threadElement.classList.remove('hidden');
      }
      else {
        threadElement.classList.add('hidden');
      }

      // Fetch the posts from the server
      fetchPostsForThread(index + 1, threadElement);

    });
  });
};

const fetchPostsForThread = (id, threadElement) => {
  // Get the thread being referenced
  let myThread = Thread.threadList[id - 1];

  console.log(`Fetching posts for thread: ${id}`);
  // fetch(`http://localhost:7777/api/threads/${id}/posts`)
  //   .then(response => {
  //     if (!response.ok) {
  //       // Catches any http 4xx or 5xx errors
  //       throw new Error("Error fetching posts. Check the address or connection.");
  //     }
  //     else {
  //       return response.json();
  //     }
  //   })
  fetchPosts(id)
    .then(data => {
      // Create post, attach to correct thread, hide
      data.forEach(post => {
        // Create a new post
        let myPost = new Post(post.text, post.user, post.name);
        let myPostElement = myPost.toDOM();
        myPostElement.classList.add('post'); // Add some styling

        // Check if the post already exists
        if (myThread.postList.some(p => p.text === myPost.text)) {
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
    .then(() => {
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

        // Add click listener to the reply button
        replyForm.getElementsByClassName('reply-button')[0].addEventListener('click', (event) => {
          event.preventDefault();

          // Get the value of the input box
          const input = replyForm.getElementsByClassName("reply-text-field");

          // return if empty
          if(input[0].value.length == 0) {
            return;
          }
          else {
            console.log("Post reply!");
            // Create a new post
            const post = new Post(input[0].value, currentUser.username, currentUser.name);

            // Try to post it
            submitNewPost(post, id);
          }
        }, false);
      }
    })
    .catch(error => console.log(error));

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

// Attempt to fetch posts for thread "id" and append to "threadElement"
// const fetchPostsForThread = (id, threadElement) => {
//   // Get the thread being referenced
//   let myThread = Thread.threadList[id - 1];

//   console.log(`Fetching posts for thread: ${id}`);
//   fetch(`http://localhost:7777/api/threads/${id}/posts`)
//     .then(response => {
//       if (!response.ok) {
//         // Catches any http 4xx or 5xx errors
//         throw new Error("Error fetching posts. Check the address or connection.");
//       }
//       else {
//         return response.json();
//       }
//     })
//     .then(data => {
//       // Create post, attach to correct thread, hide
//       data.forEach(post => {
//         // Create a new post
//         let myPost = new Post(post.text, post.user, post.name);
//         let myPostElement = myPost.toDOM();
//         myPostElement.classList.add('post'); // Add some styling

//         // Check if the post already exists
//         if (myThread.postList.some(p => p.text === myPost.text)) {
//           // If post exists, return
//           return;
//         }
//         else {
//           // Add the post to the thread
//           threadElement.append(myPostElement);
//           myThread.postList.push(myPost);
//         }
//       })
//     })
//     .then(() => {
//       // Add a reply form if, not already added
//       if (threadElement.getElementsByTagName('form').length > 0) {
//         return;
//       }
//       else {
//         let replyForm = document.createElement('li');
//         // Disgusting, please forgive me...
//         replyForm.innerHTML = `<form class="reply-form">
//         <div class="reply-form-group">
//         <label for="reply-text" class="reply-label">Reply to post: </label>
//     <input type="text" name="reply-text" class="reply-text-field" required autocomplete="off">
//     <input type="submit" class="reply-button" value="Post"/>
//     </div>
//   </form>`;
//         threadElement.append(replyForm);

//         // Add click listener to the reply button
//         replyForm.getElementsByClassName('reply-button')[0].addEventListener('click', (event) => {
//           event.preventDefault();

//           // Get the value of the input box
//           const input = replyForm.getElementsByClassName("reply-text-field");

//           // return if empty
//           if(input[0].value.length == 0) {
//             return;
//           }
//           else {
//             console.log("Post reply!");
//             // Create a new post
//             const post = new Post(input[0].value, currentUser.username, currentUser.name);

//             // Try to post it
//             submitNewPost(post, id);
//           }
//         }, false);
//       }
//     })
//     .catch(error => console.log(error));

// };

// Attempts to POST a new post to the correct thread
const submitNewPost = (post, id) => {

  fetch(`http://localhost:7777/api/threads/${id}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({user: post.user, text:post.text})
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));

    // TODO refresh the posts
    refreshPosts(id);

};

// Attempts to refresh the posts at a given thread id
const refreshPosts = (id) => {

}

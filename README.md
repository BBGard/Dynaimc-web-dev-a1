# Dynamic Web Development Assignment 1
## University Assignment
### Building an Interactive Chat Forum Front-End

#### Introduction:
This assignment involved creating an interactive front-end for an existing API using HTML, CSS, and JavaScript. The API, chat_server, allows interaction with threads, posts, and users.

#### Part One - Install the API Server Application:
- Use the following command to install the chat_server application.
```bash
deno install --allow-read --allow-net
https://cdn.jsdelivr.net/gh/ITECH3108FedUni/assignment_api@v2022.05/chat_server.js
```
- Verify installation by running the server and accessing `https://localhost:7777`.
- The in-memory database includes users, threads, and posts.

#### Data Model:
- Users have a username and a name.
- Threads have a title, an id, an icon, and an array of posts.
- Posts have a user (author) and a text field.

#### Server Functionality:
- Resources available include thread retrieval, post retrieval, user information, thread creation, and post creation.
- Deleting threads is supported.

#### Part Two - Build the Application:
- Create a front-end application using HTML, CSS, and JavaScript.
- Utilize Deno file_server to serve assignment files and chat_server for the chat forum API.

#### Key functionalities:
- User login screen.
- Displaying a list of threads.
- Creating new threads with titles and initial posts.
- Dynamically loading and displaying posts when clicking on a thread.
- Adding posts to a thread.
- Deleting threads created by the user.
- Automatic data refresh every 10 seconds.

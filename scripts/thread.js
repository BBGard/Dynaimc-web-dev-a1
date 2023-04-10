/***
 * This class describes a thread on a user forum
 * Author: Benjamin Gardiner
 */

export class Thread {
  static threadList = [];   // Tracks ALL threads
  postList = [];            // THIS threads posts

  constructor(thread_title, icon, user, id) {
    this.thread_title = thread_title; // Title of the thread
    this.icon = icon;                 // A unicode icon
    this.user = user;                 // The username of the thread author
    this.id = id;                     // A unique numeric id for the thread

    // Push thread to threadlist
    Thread.threadList.push(this);
  }

  // Returns a list item (li) DOM element representing the thread
  toDOM() {
    const html = document.createElement('li');
    html.classList.add('thread'); // Styling
    html.append(this.icon);

    const title = document.createElement('a');
    title.textContent = `${this.thread_title}`;
    title.href = `http://localhost:4505/index?id=${this.id}`;
    title.classList.add('thread-title');
    html.append(title);

    const user = document.createElement('p');
    user.textContent = `${this.user}`;
    user.classList.add('author');
    html.append(user);

    const posts = document.createElement('ul'); // To hold the threads posts
    posts.classList.add('post-list');
    posts.classList.add('hidden');  // Hide posts for now
    html.append(posts);

    return html;
  }

}

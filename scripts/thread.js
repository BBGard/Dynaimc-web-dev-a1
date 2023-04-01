export class Thread {
  // Tracks threads
  static threadList = [];
  postList = [];

  constructor(thread_title, icon, user, id) {
    this.thread_title = thread_title;
    this.icon = icon;
    this.user = user;
    this.id = id;

    // Push thread to threadlist
    Thread.threadList.push(this);
  }

  toDOM() {
    const html = document.createElement('li');
    html.classList.add('thread'); // Styling
    html.append(this.icon);

    const title = document.createElement('a');
    title.textContent = `${this.thread_title}`;
    title.href = `http://localhost:4505/index?id=${this.id}`;
    html.append(title);

    const user = document.createElement('p');
    user.textContent = `${this.user}`;
    user.classList.add('author'); // Add some styling
    html.append(user);

    const posts = document.createElement('ul');
    posts.classList.add('hidden');  // Hide posts for now
    html.append(posts);

    return html;
  }

  addPost(post) {
    this.postList.push(post);
  }
}

export class Thread {
  constructor(thread_title, icon, user, id) {
    this.thread_title = thread_title;
    this.icon = icon;
    this.user = user;
    this.id = id;
    //TODO add post array this.posts = posts;
  }

  toHTML() {
    return `<li>${this.icon} |
      <a href="#">${this.thread_title}</a>
      <p>${this.user}</p></li>`;
  }
}

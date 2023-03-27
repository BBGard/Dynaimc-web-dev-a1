class Thread {
  constructor(thread_title, icon, user, id) {
    this.thread_title = thread_title;
    this.icon = icon;
    this.user = user;
    this.id = id;
  }

  toHTML() {
    return `<li>${this.icon} |
      <a href=</li>`;
  }
}

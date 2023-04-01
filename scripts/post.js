export class Post {
  constructor(text, user, name) {
    this.text = text;
    this.user = user;
    this.name = name;
    // this.id = id;
  }

  toDOM() {
    const html = document.createElement('li');

    const postContent = document.createElement('p');
    postContent.textContent = `${this.text}`;
    html.append(postContent);

    const postName = document.createElement('p');
    postName.textContent = `${this.name}`;
    html.append(postName);

    return html;
  }
}

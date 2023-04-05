export class Post {
  constructor(text, username, name) {
    this.text = text;
    this.user = username;
    this.name = name;
    // this.id = id;
  }

  // returns a list element representing the post
  toDOM() {
    const html = document.createElement('li');

    const postContent = document.createElement('p');
    postContent.textContent = `${this.text}`;
    html.append(postContent);

    const postName = document.createElement('p');
    postName.textContent = ` - ${this.name}`;
    postName.classList.add('post-name')
    html.append(postName);

    return html;
  }

}

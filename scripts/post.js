/***
 * This class describes a post on a user forum
 * Author: Benjamin Gardiner
 */

export class Post {
  constructor(text, username, name) {
    this.text = text;       // The string message of the post
    this.user = username;   // username of the user creating the post
    this.name = name;       // Real name of the user creating the post
  }

  // Returns a list item (li) DOM element representing the post
  toDOM() {
    const html = document.createElement('li');

    const postContent = document.createElement('p');
    postContent.textContent = `${this.text}`;
    postContent.classList.add('post-content');
    html.append(postContent);

    const postName = document.createElement('p');
    postName.textContent = ` - ${this.name}`;
    postName.classList.add('post-name')
    html.append(postName);

    return html;
  }

  // Returns the JSON stringified version of this post
  stringify() {
    return JSON.stringify(
      {
        user: this.user,
        text: this.text
      });
  }

}

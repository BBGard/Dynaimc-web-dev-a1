// Check if the post already exists
const postList = document.querySelectorAll('.post-list')[id - 1];
console.log("postList");
console.log(postList);

if (Array.from(postList.children).some(
  elem => elem.querySelector('.post-content').textContent
    === postList.text)) { // And check name?
  // If post exists, return
  console.log("Post exists already");
  return;
}
else {
  // Create a new post
  let myPost = new Post(post.text, post.user, post.name);
  let myPostElement = myPost.toDOM();
  myPostElement.classList.add('post'); // Add some styling

}


const postContents = document.querySelectorAll('.post-content');

postContents.forEach(content => {
  if (content.textContent === postList.text) {
    console.log('Match found!');
  }
});

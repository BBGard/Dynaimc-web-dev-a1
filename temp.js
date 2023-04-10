
for(let i=0; i<data.lenth; i++) {
  if(data[i].text === currentPostList[i].text) {
    console.log("same post");
    return;
  }
  else {
    console.log('create post');
    const myPost = new Post(post.text, post.user, post.name);

    // Add it to the DOM
    const myPostElement = myPost.toDOM();
    myPostElement.classList.add('post'); // Add some styling

    // Check if we have a form element
    const formElement = document.querySelector(`#thread-${id} .reply-form`);

    if (formElement) {
      // If the reply form is there, append post above it
      console.log("form");
      formElement.insertAdjacentElement('beforebegin', myPostElement);
    }
    else {
      // Otherwise chuck it on the end
      console.log("no form");
      const threadElement = document.querySelector(`#thread-${id}`).querySelector('ul');
      threadElement.append(myPostElement);
    }

    // Add post to the threads postList
    myThread.postList.push(myPost);
  }


}

data.forEach(post => {
  // index++;
  const myPost = new Post(post.text, post.user, post.name);


  if(data.length === currentPostList.length) {
    console.log("equal list");
    return;
  }
  else {
    // Add it to the DOM
    const myPostElement = myPost.toDOM();
    myPostElement.classList.add('post'); // Add some styling

    // Check if we have a form element
    const formElement = document.querySelector(`#thread-${id} .reply-form`);

    if (formElement) {
      // If the reply form is there, append post above it
      console.log("form");
      formElement.insertAdjacentElement('beforebegin', myPostElement);
    }
    else {
      // Otherwise chuck it on the end
      console.log("no form");
      const threadElement = document.querySelector(`#thread-${id}`).querySelector('ul');
      threadElement.append(myPostElement);
    }

    // Add post to the threads postList
    myThread.postList.push(myPost);
  }
})

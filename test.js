fetchPosts(id)
    .then(data => {
      // Create post, attach to correct thread, hide
      console.log("got post");
      // console.log(data);
      data.forEach(post => {
        // Check if post exists already
        const postExists = myThread.postList.some(existingPost => existingPost.id === post.id);
        if (!postExists) {
          // Create a new post
          const postId = myThread.postList.length +1;
          let myPost = new Post(post.text, post.user, post.name, postId);
          let myPostElement = myPost.toDOM();
          myPostElement.classList.add('post'); // Add some styling

          // Add the post to the thread
          const formElement = threadElement.querySelector('form.reply-form');
          if (formElement) {
            // If the reply form is there, append above it
            console.log("form");
            threadElement.insertBefore(myPostElement, formElement);
          }
          else {
            // Otherwise chuck it on the end
            console.log("no form");
            threadElement.append(myPostElement);
          }

          myThread.postList.push(myPost);
        } else {
          console.log(`Post with ID ${post.id} already exists`);
        }

      })
    })
    .then(() => {
      // Add a reply form if, not already added
      console.log("adding reply");
      addReplyFormIfNeeded(threadElement, id);
    })
    .catch(error => console.log(error));

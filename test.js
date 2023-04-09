const fetchThreads = () => {

  console.log("Fetching threads");
  fetch('http://localhost:7777/api/threads')
    .then(response => {
      if (!response.ok) {
        // Catches any http 4xx or 5xx errors
        throw new Error("Error fetching threads. Check the address or connection.");
      }
      else {
        return response.json();
      }
    })
    .then(data => {
      // // Populate the thread list
      data.forEach(thread => {

        console.log(`Data length: ${data.length}`);
        const uList = Array.from(threadList.children);
        console.log(`UL length: ${uList.length}`);

        // Check if the thread already exists
        // if (Array.from(threadList.children).some(
        //   elem => elem.querySelector('.thread-title').textContent
        //     === thread.thread_title)) {
        //   // If thread exists, return
        //   console.log("Thread exists already");
        //   return;
        // }
        if( uList.length === data.length) {
          return;
        }
        else {
          // Create a new thread
          const myThread = new Thread(thread.thread_title, thread.icon, thread.user, thread.id);

          // Append thread to thread list
          threadList.append(myThread.toDOM());
        }

      });
    })
    .catch(error => console.log(error));
};

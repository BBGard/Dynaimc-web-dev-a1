function fetchPosts() {
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
      .then(jsonData => {
        // Compare the new data with the current data
        jsonData.forEach(newItem => {
          const currentItem = jsonData.find(item => item.id === newItem.id);
          if (currentItem && currentItem.timestamp === newItem.timestamp) {
            // The item has not changed
            console.log("no change");
            return;
          }
          // The item has changed, update it in the data array
          console.log("change");
          const index = data.indexOf(currentItem);
          if (index !== -1) {
            jsonData[index] = newItem;
          } else {
            jsonData.push(newItem);
          }
          // Update the UI with the new data
          updateUI();
        });
      });
  }

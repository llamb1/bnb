//Scripts.js
//Black and Blu
//Index:
//1. fetchItems()
//2. fetchRooms()
//3. fetchPeople()
//4. populateInventory()

function fetchItems() {
  return fetch('./json/items.json')
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error(error));
}

function fetchRooms() {
    return fetch('./json/rooms.json')
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error(error))
}

function fetchPeople() {
    return fetch('./json/people.json')
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error(error))
}

fetchItems()
  .then(data => {
    // Process and use the fetched items data
    console.log(data); // Log the data to the console or perform further operations
  })
  .catch(error => {
    // Handle any errors that occurred during fetching
    console.error('Error fetching items:', error);
  });

  fetchRooms()
  .then(data => {
    // Process and use the fetched items data
    console.log(data); // Log the data to the console or perform further operations
  })
  .catch(error => {
    // Handle any errors that occurred during fetching
    console.error('Error fetching items:', error);
  });

  fetchPeople()
  .then(data => {
    // Process and use the fetched items data
    console.log(data); // Log the data to the console or perform further operations
  })
  .catch(error => {
    // Handle any errors that occurred during fetching
    console.error('Error fetching items:', error);
  });

//Inventory management
function populateInventory() {
  const inventoryList = document.getElementById('inventoryList');

  fetchItems()
    .then(items => {
      const ownedItems = items.filter(item => item.owned === true);

      if (ownedItems.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'Nothing';
        inventoryList.appendChild(listItem);
      } else {
        ownedItems.forEach(item => {
          const listItem = document.createElement('li');
          listItem.textContent = item.name;
          inventoryList.appendChild(listItem);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching items:', error);
    });
}

function populatePeople() {
  const peopleList = document.getElementById('peopleList');

  fetchPeople()
    .then(people => {
      const presentPeople = people.filter(person => person.present === true);

      if (presentPeople.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'Nobody';
        peopleList.appendChild(listItem);
      } else {
        presentPeople.forEach(person => {
          const listItem = document.createElement('li');
          listItem.textContent = person.name;
          peopleList.appendChild(listItem);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching people:', error);
    });
}

let currentRoomID = 1;  // Initialize the room ID to 1 (or whatever room the player starts in)

function fetchRoomByID(roomID) {
  return fetch('./json/rooms.json')
    .then(response => response.json())
    .then(data => data.find(room => room.roomID === roomID))
    .catch(error => console.error(error));
}

function updateDisplayArea() {
    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.textContent = game.currentRoom.description;
    
    displayArea.innerHTML = "";
    displayArea.appendChild(descriptionParagraph);
    
    // If there are additional details (like exits and items), add them to the display area.
    if (game.currentRoom.exits) {
        const exitsHeader = document.createElement('h2');
        exitsHeader.textContent = "Exits";
        displayArea.appendChild(exitsHeader);
        
        game.currentRoom.exits.forEach(exit => {
            const exitParagraph = document.createElement('p');
            exitParagraph.textContent = exit;
            displayArea.appendChild(exitParagraph);
        });
    }
    
    if (game.currentRoom.items) {
        const itemsHeader = document.createElement('h2');
        itemsHeader.textContent = "Items";
        displayArea.appendChild(itemsHeader);
        
        game.currentRoom.items.forEach(item => {
            const itemParagraph = document.createElement('p');
            itemParagraph.textContent = item.name;
            displayArea.appendChild(itemParagraph);
        });
    }
}



function enterRoom(room) {
    game.currentRoom = room;
    
    // Populate exits and items for the current room
    populateExits(game.currentRoom);
    populateItems(game.currentRoom);
    
    // Set the entry message as the room description
    game.currentRoom.description = room.entryMsg;
    
    // Update the display area
    updateDisplayArea();
}


async function populateExits() {
  const displayArea = document.getElementById('display-area');
  const directions = ['up', 'down', 'north', 'south', 'east', 'west'];

  let room;
  try {
    room = await fetchRoomByID(currentRoomID);
  } catch(error) {
    console.error('Error fetching room:', error);
    return;
  }

  const exits = directions.filter(direction => room[direction] === "y");

  if (exits.length === 0) {
    displayArea.insertAdjacentHTML('afterbegin', '<p>No exits</p>');
  } else {
    const exitList = exits.join(', ');
    displayArea.insertAdjacentHTML('afterbegin', `<p>Exits: ${exitList}</p>`);
  }
}

async function populateItems() {
  const displayArea = document.getElementById('display-area');

  let items;
  try {
    const response = await fetch('./json/items.json');
    items = await response.json();
  } catch(error) {
    console.error('Error fetching items:', error);
    return;
  }

  const roomItems = items.filter(item => item.origRoom === currentRoomID && item.owned === "false");

  if (roomItems.length === 0) {
    displayArea.insertAdjacentHTML('afterbegin', '<p>No items</p>');
  } else {
    const itemList = roomItems.map(item => item.name).join(', ');
    displayArea.insertAdjacentHTML('afterbegin', `<p>Items: ${itemList}</p>`);
  }
}

populateInventory();
populatePeople();
updateDisplayArea();


//Scripts.js
//Black and Blu

// Fetch JSON data

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

// Example usage: fetchItems().then(data => console.log(data)).catch(error => console.error(error));

// Inventory management

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

// Room navigation

let currentRoomID = 1;  // Initialize the room ID to 1

function fetchRoomByID(roomID) {
  return fetch('./json/rooms.json')
    .then(response => response.json())
    .then(data => data.find(room => room.roomID === roomID))
    .catch(error => console.error(error));
}

async function updateDisplayArea() {
  const displayArea = document.getElementById('display-area');

  let room;
  try {
    room = await fetchRoomByID(currentRoomID);
  } catch(error) {
    console.error('Error fetching room:', error);
    return;
  }

  let message = room.longDesc;
  if (room.new) {
    message = room.entryMsg;
    room.new = false; // Mark room as visited
  }

  displayArea.innerHTML = ''; // Clear the display area

  // Insert room description into the display area
  const paragraph = document.createElement('p');
  paragraph.innerHTML = message;
  displayArea.appendChild(paragraph);

  // Populate exits and items for the current room
  await populateExits();
  await populateItems();
}

async function enterRoom(room) {
  game.currentRoom = room;

  // Set the entry message as the room description
  game.currentRoom.description = room.entryMsg;

  // Update the display area
  await updateDisplayArea();
}

async function populateExits() {
  const exitsList = document.getElementById('exitsList');
  exitsList.innerHTML = ''; // Clear the exits list first
  const directions = ['Up', 'Down', 'North', 'South', 'East', 'West'];

  let room;
  try {
    room = await fetchRoomByID(currentRoomID);
  } catch(error) {
    console.error('Error fetching room:', error);
    return;
  }

  const exits = directions.filter(direction => room.exits[direction] && room.exits[direction] !== 9999);

  if (exits.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'No exits';
    exitsList.appendChild(listItem);
  } else {
    exits.forEach(exit => {
      const listItem = document.createElement('li');
      listItem.textContent = exit;
      exitsList.appendChild(listItem);
    });
  }
}

async function populateItems() {
  const itemsList = document.getElementById('itemsList');
  itemsList.innerHTML = ''; // Clear the items list first

  let items;
  try {
    const response = await fetch('./json/items.json');
    items = await response.json();
  } catch(error) {
    console.error('Error fetching items:', error);
    return;
  }

  const roomItems = items.filter(item => item.origRoom === currentRoomID && item.owned === true);

  if (roomItems.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'No items';
    itemsList.appendChild(listItem);
  } else {
    roomItems.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item.name;
      itemsList.appendChild(listItem);
    });
  }
}


async function move(direction) {
  const room = await fetchRoomByID(currentRoomID);
  const nextRoomID = room.exits[direction];

  if (nextRoomID === 9999) {
    console.log('There is no exit in that direction.');
    return;
  }

  currentRoomID = nextRoomID;
  await updateDisplayArea();
  await populateExits();
  await populateItems();
}

// Initialize the game

populateInventory();
populatePeople();
updateDisplayArea();

document.addEventListener("DOMContentLoaded", function() {
  populateExits();
  populateItems();

  document.getElementById('move-north').addEventListener('click', () => move('North'));
  document.getElementById('move-south').addEventListener('click', () => move('South'));
  document.getElementById('move-east').addEventListener('click', () => move('East'));
  document.getElementById('move-west').addEventListener('click', () => move('West'));
  document.getElementById('move-up').addEventListener('click', () => move('Up'));
  document.getElementById('move-down').addEventListener('click', () => move('Down'));
});

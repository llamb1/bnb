//Scripts.js
//Black and Blu

// Fetch JSON data

function fetchItems() {
  return fetch('./items.json')
    .then(response => response.json())
    .then(data => {
      populateItems(); // Call populateItems() after fetching the items
      return data;
    })
    .catch(error => console.error(error));
}

function fetchRooms() {
  return fetch('./rooms.json')
    .then(response => response.json())
    .then(data => {
      populateExits(); // Call populateExits() after fetching the rooms
      return data;
    })
    .catch(error => console.error(error));
}

function fetchPeople() {
  return fetch('./people.json')
    .then(response => response.json())
    .then(data => {
      populatePeople(); // Call populatePeople() after fetching the people
      return data;
    })
    .catch(error => console.error(error));
}

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

      peopleList.innerHTML = ''; // Clear the people list first

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
  } catch (error) {
    console.error('Error fetching room:', error);
    return;
  }

  let message = room.longDesc;
  if (room.new) {
    message = room.entryMsg;
    room.new = false; // mark room as visited
  }

  displayArea.innerHTML = ''; // Clear the display area

  // Insert room description into the display area
  const paragraph = document.createElement('p');
  paragraph.innerHTML = message;
  displayArea.appendChild(paragraph);

  // Populate exits and items for the current room
  populateExits(room);
  populateItems(room); // Add this line to populate the items

  // Update the display area with exits and items
  displayArea.appendChild(document.createElement('hr'));
  displayArea.appendChild(document.createTextNode('Exits:'));
  displayArea.appendChild(document.createElement('br'));
  displayArea.appendChild(document.createElement('ul')).id = 'exitsList';
  displayArea.appendChild(document.createElement('hr'));
  displayArea.appendChild(document.createTextNode('Items:'));
  displayArea.appendChild(document.createElement('br'));
  displayArea.appendChild(document.createElement('ul')).id = 'itemsList';
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

  const exits = directions.filter(direction => room.exits[direction] !== 9999);

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

  const roomItems = items.filter(item => item.origRoom === currentRoomID && item.owned === false);

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

document.addEventListener("DOMContentLoaded", async function() {
  await populateExits();
  await populateItems();
  updateDisplayArea();

  document.getElementById('move-north').addEventListener('click', () => move('North'));
  document.getElementById('move-south').addEventListener('click', () => move('South'));
  document.getElementById('move-east').addEventListener('click', () => move('East'));
  document.getElementById('move-west').addEventListener('click', () => move('West'));
  document.getElementById('move-up').addEventListener('click', () => move('Up'));
  document.getElementById('move-down').addEventListener('click', () => move('Down'));
});


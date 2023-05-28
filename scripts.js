//Scripts.js
//Black and Blu

// Room navigation

let currentRoomID = 1;  // Initialize the room ID to 1

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

async function fetchRoomByID(roomID) {
  try {
    const response = await fetch('./rooms.json');
    const data = await response.json();
    return data.find(room => room.roomID.toString() === roomID.toString());
  } catch (error) {
    console.error('Error fetching room:', error);
    return null;
  }
}

async function updateDisplayArea() {
  const displayArea = document.getElementById('display-area');

  try {
    const room = await fetchRoomByID(currentRoomID);
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
    populateExits();
    populateItems();

    // Update the display area with exits and items
    displayArea.appendChild(document.createElement('hr'));
    displayArea.appendChild(document.createTextNode('Exits:'));
    displayArea.appendChild(document.createElement('br'));
    displayArea.appendChild(document.createElement('ul')).id = 'exitsList';
    displayArea.appendChild(document.createElement('hr'));
    displayArea.appendChild(document.createTextNode('Items:'));
    displayArea.appendChild(document.createElement('br'));
    displayArea.appendChild(document.createElement('ul')).id = 'itemsList';
  } catch (error) {
    console.error('Error fetching room:', error);
  }
}


function populateExits(room) {
  const exits = room.exits;

  for (const direction in exits) {
    const exitID = exits[direction];
    if (exitID !== 9999) {
      const exitName = rooms.find(room => room.roomID === exitID).roomName;
      exitsList.innerHTML += `<li><a href="#" onclick="goToRoom(${exitID});">${direction}: ${exitName}</a></li>`;
    }
  }
}


function populateItems(room) {
  const roomItems = room.items;

  for (const itemName of roomItems) {
    itemsList.innerHTML += `<li>${itemName}</li>`;
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

document.addEventListener('DOMContentLoaded', async function () {
  updateDisplayArea();
  await populateExits();
  await populateItems();

  document.getElementById('move-north').addEventListener('click', () => move('North'));
  document.getElementById('move-south').addEventListener('click', () => move('South'));
  document.getElementById('move-east').addEventListener('click', () => move('East'));
  document.getElementById('move-west').addEventListener('click', () => move('West'));
  document.getElementById('move-up').addEventListener('click', () => move('Up'));
  document.getElementById('move-down').addEventListener('click', () => move('Down'));
});

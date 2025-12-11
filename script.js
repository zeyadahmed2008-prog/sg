let events = JSON.parse(localStorage.getItem('events') || '[]');
let invitationHistory = JSON.parse(localStorage.getItem('invitationHistory') || '[]');

const eventSelect = document.getElementById('eventSelect');
const createInvitationSection = document.getElementById('create-invitation');
const invitationResult = document.getElementById('invitationResult');
const historyTable = document.getElementById('historyTable').querySelector('tbody');
const eventList = document.getElementById('eventList');

function saveEvents() {
  localStorage.setItem('events', JSON.stringify(events));
}
function saveInvitationHistory() {
  localStorage.setItem('invitationHistory', JSON.stringify(invitationHistory));
}

function refreshEventSelect() {
  eventSelect.innerHTML = '';
  eventList.innerHTML = '';
  events.forEach((event, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = event.name + ' (' + event.date + ')';
    eventSelect.appendChild(option);

    const li = document.createElement('li');
    li.innerHTML = `${event.name} (${event.date})
      <button onclick="deleteEvent(${index})">Delete</button>`;
    eventList.appendChild(li);
  });
  createInvitationSection.style.display = events.length > 0 ? 'block' : 'none';
}

function refreshHistoryList() {
  historyTable.innerHTML = '';
  if (invitationHistory.length === 0) {
    historyTable.innerHTML = '<tr><td colspan="4">No invitations yet.</td></tr>';
    return;
  }
  invitationHistory.forEach((inv, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${inv.guestName}</td>
      <td>${inv.eventName}</td>
      <td><a href="${inv.url}" target="_blank">Open</a></td>
      <td><button onclick="deleteHistory(${index})">Delete</button></td>
    `;
    historyTable.appendChild(row);
  });
}

function deleteEvent(i){
  events.splice(i,1);
  saveEvents();
  refreshEventSelect();
}

function deleteHistory(i){
  invitationHistory.splice(i,1);
  saveInvitationHistory();
  refreshHistoryList();
}

document.getElementById('saveEvent').addEventListener('click', () => {
  const name = document.getElementById('eventName').value.trim();
  const venue = document.getElementById('venue').value.trim();
  const description = document.getElementById('description').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const dressCode = document.getElementById('dressCode').value.trim();

  if (!name || !venue || !date || !time) {
    alert('Fill all required fields.');
    return;
  }

  events.push({ name, venue, description, date, time, dressCode });
  saveEvents();
  refreshEventSelect();
  alert('Event saved!');
});

document.getElementById('generateInvitation').addEventListener('click', () => {
  const guestName = document.getElementById('guestName').value.trim();
  const eventIndex = eventSelect.value;
  if (!guestName) { alert('Guest name required'); return; }
  const event = events[eventIndex];
  if (!event) { alert('Select event'); return; }

  const payload = { ...event, guest: guestName };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const url = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "/") + "invite.html?data=" + encodeURIComponent(b64);

  invitationResult.innerHTML = `<pre>${json}</pre><div id="qrcode"></div>`;
  new QRCode(document.getElementById("qrcode"), url);

  invitationHistory.push({ guestName, eventName: event.name, url });
  saveInvitationHistory();
  refreshHistoryList();
});

document.getElementById('clearHistory').addEventListener('click', () => {
  if(confirm("Clear all history?")){
    invitationHistory = [];
    saveInvitationHistory();
    refreshHistoryList();
  }
});

document.getElementById('exportHistory').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(invitationHistory, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "invitations.json";
  a.click();
});

document.getElementById('changePass').addEventListener('click', () => {
  const newPass = document.getElementById('newPass').value.trim();
  if(!newPass){ alert("Enter new password"); return; }
  localStorage.setItem("sg_password", newPass);
  alert("Password updated!");
});

// Init
refreshEventSelect();
refreshHistoryList();

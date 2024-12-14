document.addEventListener('DOMContentLoaded', (event) => {
    loadNotes();
});

let currentNoteId = null;

function loadNotes() {
    let notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    let notes = JSON.parse(localStorage.getItem('notes')) || {};

    for (let id in notes) {
        let note = notes[id];
        let noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <span onclick="loadNoteContent('${id}')">${note.title}</span>
            <span class="material-icons edit-btn" onclick="editNoteTitle('${id}')">edit</span>
        `;
        notesList.appendChild(noteItem);
    }
}

function loadNoteContent(id) {
    currentNoteId = id;
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    let note = notes[id];
    document.getElementById('note-title').innerText = note.title;
    document.getElementById('note-content').innerHTML = note.content;

    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.note-item').classList.add('active');

    showLinkPreview();
}

function createNewNote() {
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    let id = 'note_' + new Date().getTime();
    notes[id] = {
        title: 'Untitled Note',
        content: ''
    };
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
    loadNoteContent(id);
}

function editNoteTitle(id) {
    let newTitle = prompt("Enter new title:");
    if (newTitle) {
        let notes = JSON.parse(localStorage.getItem('notes')) || {};
        notes[id].title = newTitle;
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }
}

function saveContent() {
    if (!currentNoteId) return;

    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    let note = notes[currentNoteId];
    note.content = document.getElementById('note-content').innerHTML;
    localStorage.setItem('notes', JSON.stringify(notes));

    // Show auto-save indicator
    let autoSaveIndicator = document.getElementById('auto-save');
    autoSaveIndicator.style.display = 'block';
    setTimeout(() => {
        autoSaveIndicator.style.display = 'none';
    }, 1000);

    showLinkPreview();
}

function formatText(command, value) {
    document.execCommand(command, false, value);
}

function changeFont(font) {
    document.getElementById('note-content').style.fontFamily = font;
}

function insertLink() {
    let url = prompt("Enter URL:");
    if (url) {
        document.execCommand('createLink', false, url);
        saveContent();
    }
}

function showLinkPreview() {
    let noteContent = document.getElementById('note-content');
    let linkPreview = document.getElementById('link-preview');

    let links = noteContent.getElementsByTagName('a');
    if (links.length > 0) {
        let link = links[0].href;
        fetchLinkPreview(link);
    } else {
        linkPreview.style.display = 'none';
    }
}

async function fetchLinkPreview(link) {
    let linkPreview = document.getElementById('link-preview');
    let linkImage = document.getElementById('link-image');
    let linkTitle = document.getElementById('link-title');
    let linkDescription = document.getElementById('link-description');

    try {
        let response = await fetch(`https://api.linkpreview.net/?key=YOUR_API_KEY&q=${link}`);
        let data = await response.json();
        linkImage.src = data.image;
        linkTitle.innerText = data.title;
        linkDescription.innerText = data.description;
        linkPreview.style.display = 'block';
    } catch (error) {
        console.error("Error fetching link preview:", error);
        linkPreview.style.display = 'none';
    }
}
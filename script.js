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
        noteItem.setAttribute('data-id', id);
        noteItem.innerHTML = `
            <span>${notes[id].title}</span>
            <span class="material-icons menu-icon" onclick="toggleNoteMenu('${id}')">more_vert</span>
            <div class="note-item-menu" id="menu-${id}">
                <ul>
                    <li onclick="renameNoteContent('${id}')">Rename</li>
                    <li onclick="downloadNoteContent('${id}', 'html')">Download html</li>
                    <li onclick="deleteNoteContent('${id}')">Delete</li>
                </ul>
            </div>
        `;
        noteItem.addEventListener('click', function () {
            loadNoteContent(id);
        });
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
        let response = await fetch(`https://api.linkpreview.net/?key=c504d0b5174307ad2a9ebde6fd8daa55&q=${link}`);
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

function renameNoteContent(id) {
    let newTitle = prompt("Enter New Title:");
    if (newTitle) {
        let notes = JSON.parse(localStorage.getItem('notes')) || {};
        notes[id].title = newTitle;
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        loadNoteContent(id);
    }
}

function deleteNoteContent(id) {
    if (confirm("Are you sure you want to delete this note?")) {
        let notes = JSON.parse(localStorage.getItem('notes')) || {};
        delete notes[id];
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        document.getElementById('note-title').innerText = '';
        document.getElementById('note-content').innerHTML = '';
    }
}

function toggleNoteMenu(id) {
    const menu = document.getElementById(`menu-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function toggleDownloadDropdown(id) {
    const dropdown = document.getElementById(`download-dropdown-${id}`);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function showDownloadDropdown() {
    const dropdown = document.querySelector('.note-download-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    dropdown.style.position = dropdown.style.position === 'absolute' ? 'none' : 'absolute';
}

function downloadNoteContent(id, format) {
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    let note = notes[id];
    let content = note.content;
    
    let blob;
    if (format === 'doc') {
        blob = new Blob([content], { type: 'application/msword' });
    } else if (format === 'pdf') {
        blob = new Blob([content], { type: 'application/pdf' });
    } else if (format === 'html') {
        blob = new Blob([content], { type: 'text/html' });
    } else if (format === 'png') {
        // For PNG, you would need to convert the HTML content to an image (using a library like html2canvas).
        html2canvas(document.querySelector('#note-content')).then(canvas => {
            canvas.toBlob(function (blob) {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = `${note.title}.png`;
                a.click();
                window.URL.revokeObjectURL(url);
            });
        });
        return;
    }

    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function increaseFontSize() {
    document.execCommand('fontSize', false, '7');
    saveContent();
}

function formatText(command) {
    document.execCommand(command, false, null);
    saveContent();
}
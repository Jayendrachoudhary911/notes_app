document.addEventListener('DOMContentLoaded', function () {
    loadNotes();

    // Right-click context menu for text formatting
    document.getElementById('note-content').addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', function () {
        document.getElementById('context-menu').style.display = 'none';
        document.querySelector('.note-item-menu').style.display = 'none';
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.getElementById('context-menu').style.display = 'none';
            document.querySelector('.note-item-menu').style.display = 'none';
        }
    });
});

function showContextMenu(x, y) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'block';
}

function createNewNote() {
    const noteTitle = prompt("Enter Note Title:");
    if (noteTitle) {
        const noteId = `note-${new Date().getTime()}`;
        let notes = JSON.parse(localStorage.getItem('notes')) || {};
        notes[noteId] = { title: noteTitle, content: '' };
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        loadNoteContent(noteId);
    }
}

function loadNotes() {
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    let notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    for (let id in notes) {
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
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    document.getElementById('note-title').innerText = notes[id].title;
    document.getElementById('note-content').innerHTML = notes[id].content;
    showLinkPreview();
}

function saveContent() {
    let id = document.querySelector('.note-item.active').getAttribute('data-id');
    let content = document.getElementById('note-content').innerHTML;
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    notes[id].content = content;
    localStorage.setItem('notes', JSON.stringify(notes));

    let autoSave = document.getElementById('auto-save');
    autoSave.style.display = 'inline';
    setTimeout(() => {
        autoSave.style.display = 'none';
    }, 1000);
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

    // Include link preview if present
    const linkPreview = document.getElementById('link-preview');
    if (linkPreview.style.display === 'block') {
        content += `<div><img src="${document.getElementById('link-image').src}" alt="Link Preview Image"><br>`;
        content += `<strong>${document.getElementById('link-title').innerText}</strong><br>`;
        content += `${document.getElementById('link-description').innerText}</div>`;
    }

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

function insertLink() {
    let url = prompt("Enter the URL:");
    if (url) {
        document.execCommand('createLink', false, url);
        saveContent();
        showLinkPreview();
    }
}

function changeFont(fontName) {
    document.execCommand('fontName', false, fontName);
    saveContent();
}

function showLinkPreview() {
    let links = document.querySelectorAll('#note-content a');
    if (links.length > 0) {
        let url = links[0].href;
        fetchLinkPreview(url);
    }
}

function fetchLinkPreview(url) {
    // Use your link preview API here
    fetch(`https://api.linkpreview.net/?key=YOUR_API_KEY&q=${url}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('link-preview').style.display = 'block';
            document.getElementById('link-image').src = data.image;
            document.getElementById('link-title').innerText = data.title;
            document.getElementById('link-description').innerText = data.description;
        });
}
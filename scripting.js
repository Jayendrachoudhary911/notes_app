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
                    <li onclick="renameNoteContent('${id}')">
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M80-120v-80h800v80H80Zm680-160v-560h60v560h-60Zm-600 0 210-560h100l210 560h-96l-50-144H308l-52 144h-96Zm176-224h168l-82-232h-4l-82 232Z"/></svg></li>
                    <li onclick="downloadNoteContent('${id}', 'html')">
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-280h400v-80H280v80Zm200-120 160-160-56-56-64 62v-166h-80v166l-64-62-56 56 160 160Zm0 320q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg></li>
                    <li class="delete" onclick="deleteNoteContent('${id}')">
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#BB271A"><path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg></li>
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
    document.execCommand('fontSize', false, '5');
    saveContent();
}
function decreaseFontSize() {
    document.execCommand('fontSize', true, '3');
    saveContent();
}

function formatText(command) {
    document.execCommand(command, false, null);
    saveContent();
}

    document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const urlInputBtn = document.getElementById("addUrlBtn");
    const urlInput = document.getElementById("urlInput");
    const textArea = document.getElementById("note-content");

    // Function to create a resizable, draggable image element
    function createImageElement(src) {
        const imgContainer = document.createElement("div");
        imgContainer.style.position = "absolute";
        imgContainer.style.display = "inline-block";
        imgContainer.style.border = "1px dashed #ccc";
        imgContainer.style.cursor = "grab";
        imgContainer.style.width = "150px";
        imgContainer.style.height = "auto";

        const img = document.createElement("img");
        img.src = src;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.borderRadius = "15px";
        img.draggable = false;

        // Create a resize handle at the bottom-right corner
        const resizeHandle = document.createElement("div");
        resizeHandle.style.width = "10px";
        resizeHandle.style.height = "10px";
        img.style.borderRadius = "15px";
        resizeHandle.style.background = "#333";
        resizeHandle.style.position = "absolute";
        resizeHandle.style.right = "0";
        resizeHandle.style.bottom = "0";
        resizeHandle.style.cursor = "nwse-resize";

        imgContainer.appendChild(img);
        imgContainer.appendChild(resizeHandle);
        textArea.appendChild(imgContainer);

        // Dragging functionality
        imgContainer.addEventListener("mousedown", startDrag);

        function startDrag(event) {
            if (event.target === resizeHandle) return; // Prevent dragging when resizing
            let shiftX = event.clientX - imgContainer.getBoundingClientRect().left;
            let shiftY = event.clientY - imgContainer.getBoundingClientRect().top;

            imgContainer.style.cursor = "grabbing";

            function moveAt(pageX, pageY) {
                imgContainer.style.left = pageX - shiftX + "px";
                imgContainer.style.top = pageY - shiftY + "px";
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener("mousemove", onMouseMove);

            document.onmouseup = function () {
                document.removeEventListener("mousemove", onMouseMove);
                imgContainer.style.cursor = "grab";
                document.onmouseup = null;
            };

            imgContainer.ondragstart = function () {
                return false;
            };
        }

        // Resizing functionality
        resizeHandle.addEventListener("mousedown", startResize);

        function startResize(event) {
            event.stopPropagation(); // Prevent triggering the drag event
            let initialX = event.clientX;
            let initialY = event.clientY;
            let initialWidth = imgContainer.offsetWidth;
            let initialHeight = imgContainer.offsetHeight;

            function onMouseMove(event) {
                const widthChange = event.clientX - initialX;
                const heightChange = event.clientY - initialY;

                imgContainer.style.width = initialWidth + widthChange + "px";
                imgContainer.style.height = initialHeight + heightChange + "px";
            }

            document.addEventListener("mousemove", onMouseMove);

            document.onmouseup = function () {
                document.removeEventListener("mousemove", onMouseMove);
                document.onmouseup = null;
            };
        }
    }

    // Save images to localStorage
    function saveImageToLocalStorage(src) {
        let savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];
        savedImages.push(src);
        localStorage.setItem("savedImages", JSON.stringify(savedImages));
    }

    // Load images from localStorage
    function loadImagesFromLocalStorage() {
        const savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];
        savedImages.forEach(src => {
            createImageElement(src);
        });
    }

    // Handle image upload
    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const imageSrc = e.target.result;
            createImageElement(imageSrc);
            saveImageToLocalStorage(imageSrc);
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    });

    // Handle URL image insertion
    urlInputBtn.addEventListener("click", function () {
        const url = urlInput.value.trim();
        if (url) {
            createImageElement(url);
            saveImageToLocalStorage(url);
            urlInput.value = ""; // Clear the input after adding
        }
    });

    // Load saved images on page load
    loadImagesFromLocalStorage();
});

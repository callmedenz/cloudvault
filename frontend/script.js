document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerText = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggle.innerText = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.innerText = "🌙";
  }
});


  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const selectedFileText = document.getElementById("selectedFile");
  const status = document.getElementById("status");

  dropZone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      selectedFileText.innerText = "Selected: " + fileInput.files[0].name;
    }
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      selectedFileText.innerText = "Selected: " + e.dataTransfer.files[0].name;
    }
  });

  window.uploadFile = async function () {
    if (!fileInput.files.length) {
      status.innerText = "Please select a file";
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    selectedFileText.innerText = "Uploading: " + file.name;
    status.innerText = "";

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        selectedFileText.innerText = "Uploaded: " + file.name;

        setTimeout(() => {
          selectedFileText.innerText = "No file selected";
          fileInput.value = "";
        }, 2000);

        loadFiles();
      } else {
        selectedFileText.innerText = "Upload failed";
      }
    } catch (error) {
      selectedFileText.innerText = "Upload failed";
    }
  };

async function loadFiles() {
  const fileGrid = document.getElementById("fileGrid");
  fileGrid.innerHTML = "";

  try {
    const response = await fetch("http://localhost:5000/files");
    const files = await response.json();

    files.forEach(file => {
      const card = document.createElement("div");
      card.className = "file-card";

      // Preview box
      const preview = document.createElement("div");
      preview.className = "file-preview";

      if (isImage(file.name)) {
        const img = document.createElement("img");
        img.src = file.url;
        img.alt = file.name;

        img.onerror = () => {
          img.remove();
          preview.innerHTML = `<div class="file-icon">${getFileIcon(file.name)}</div>`;
        };

        preview.appendChild(img);
      } else {
        preview.innerHTML = `<div class="file-icon">${getFileIcon(file.name)}</div>`;
      }

      const name = document.createElement("div");
      name.className = "file-name";
      name.innerText = file.name;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "file-delete";
      deleteBtn.innerText = "×";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteFile(file.name);
      };

      card.onclick = () => window.open(file.url, "_blank");

      card.appendChild(deleteBtn);
      card.appendChild(preview);
      card.appendChild(name);

      fileGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load files", error);
  }
}



function isImage(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

function getFileIcon(filename) {
  const ext = filename.split(".").pop().toLowerCase();

  if (["pdf"].includes(ext)) return "📕";
  if (["zip", "rar", "7z"].includes(ext)) return "📦";
  if (["mp3", "wav"].includes(ext)) return "🎵";
  if (["mp4", "mkv"].includes(ext)) return "🎬";

  return "📄";
}




  async function deleteFile(filename) {
    if (!confirm(`Delete ${filename}?`)) return;

    await fetch(
      `http://localhost:5000/delete/${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    );

    loadFiles();
  }

  loadFiles();
});

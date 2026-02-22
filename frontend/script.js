document.addEventListener("DOMContentLoaded", () => {

  /* ===========================
     Theme Toggle
     =========================== */
  const themeToggle = document.getElementById("themeToggle");

  // Apply saved theme on load
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerText = "☀️";
  } else {
    themeToggle.innerText = "🌙";
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    if (isDark) {
      localStorage.setItem("theme", "dark");
      themeToggle.innerText = "☀️";
    } else {
      localStorage.setItem("theme", "light");
      themeToggle.innerText = "🌙";
    }
  });


  /* ===========================
     Drag & Drop / File Input
     =========================== */
  const dropZone     = document.getElementById("dropZone");
  const fileInput    = document.getElementById("fileInput");
  const selectedFile = document.getElementById("selectedFile");
  const status       = document.getElementById("status");

  // Click to open file picker
  dropZone.addEventListener("click", () => fileInput.click());

  // File selected via input
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      selectedFile.innerText = fileInput.files[0].name;
    }
  });

  // Drag over
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  // Drag leave
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  // Drop
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      selectedFile.innerText = e.dataTransfer.files[0].name;
    }
  });


  /* ===========================
     Upload
     =========================== */
  window.uploadFile = async function () {
    if (!fileInput.files.length) {
      status.innerText = "⚠ Please select a file first.";
      return;
    }

    const file     = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    selectedFile.innerText = `Uploading: ${file.name}`;
    status.innerText = "";

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        selectedFile.innerText = `✓ Uploaded: ${file.name}`;
        status.innerText = "";

        setTimeout(() => {
          selectedFile.innerText = "No file selected";
          fileInput.value = "";
        }, 2500);

        loadFiles();
        loadStorageStats();
      } else {
        selectedFile.innerText = "Upload failed.";
        status.innerText = "Server returned an error.";
      }
    } catch (error) {
      selectedFile.innerText = "Upload failed.";
      status.innerText = "Could not reach the server.";
    }
  };


  /* ===========================
     Load Files
     =========================== */
  async function loadFiles() {
    const fileGrid   = document.getElementById("fileGrid");
    const filesCount = document.getElementById("filesCount");
    fileGrid.innerHTML = "";

    try {
      const response = await fetch("http://localhost:5000/files");
      const files    = await response.json();

      filesCount.innerText = `${files.length} file${files.length !== 1 ? "s" : ""}`;

      if (files.length === 0) {
        fileGrid.innerHTML = `
          <div class="empty-state">
            <span class="empty-state-icon">📭</span>
            No files uploaded yet
          </div>`;
        return;
      }

      files.forEach((file) => {
        const card = document.createElement("div");
        card.className = "file-card";

        // Preview
        const preview = document.createElement("div");
        preview.className = "file-preview";

        if (isImage(file.name)) {
          const img = document.createElement("img");
          img.src = file.url;
          img.alt = file.name;
          img.onerror = () => {
            img.remove();
            preview.innerHTML = `<span>${getFileIcon(file.name)}</span>`;
          };
          preview.appendChild(img);
        } else {
          preview.innerHTML = `<span>${getFileIcon(file.name)}</span>`;
        }

        // File name
        const name = document.createElement("span");
        name.className = "file-name";
        name.innerText = file.name;

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "file-del";
        deleteBtn.innerHTML = "&times;";
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          deleteFile(file.name);
        };

        // Open file on click
        card.onclick = () => window.open(file.url, "_blank");

        card.appendChild(deleteBtn);
        card.appendChild(preview);
        card.appendChild(name);
        fileGrid.appendChild(card);
      });

    } catch (error) {
      fileGrid.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon">⚠️</span>
          Could not load files
        </div>`;
      console.error("Failed to load files:", error);
    }
  }


  /* ===========================
     Delete File
     =========================== */
  async function deleteFile(filename) {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      await fetch(`http://localhost:5000/delete/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      loadFiles();
      loadStorageStats();
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }


  /* ===========================
     Storage Stats
     =========================== */
  async function loadStorageStats() {
    try {
      const res  = await fetch("http://localhost:5000/stats");
      const data = await res.json();

      const used    = data.total_size_mb;
      const limit   = data.limit_mb;
      const percent = Math.min((used / limit) * 100, 100);

      document.getElementById("storageText").innerText =
        `${used} MB used of ${limit} MB  ·  ${data.total_files} file${data.total_files !== 1 ? "s" : ""}`;

      document.getElementById("storageFill").style.width = percent + "%";

    } catch (err) {
      document.getElementById("storageText").innerText = "Failed to load storage data";
    }
  }


  /* ===========================
     Helpers
     =========================== */
  function isImage(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  }

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext))              return "📕";
    if (["zip", "rar", "7z"].includes(ext)) return "📦";
    if (["mp3", "wav", "ogg"].includes(ext)) return "🎵";
    if (["mp4", "mkv", "mov"].includes(ext)) return "🎬";
    if (["doc", "docx"].includes(ext))      return "📝";
    if (["xls", "xlsx"].includes(ext))      return "📊";
    return "📄";
  }


  /* ===========================
     Init
     =========================== */
  loadFiles();
  loadStorageStats();

});

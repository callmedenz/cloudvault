
# ☁️ CloudVault – Cloud File Storage App

CloudVault is a beginner-friendly cloud file storage web application inspired by Google Drive.
It allows users to upload, view, preview, and delete files securely using AWS S3.

This project is designed for learning cloud concepts, backend–frontend integration, and UI/UX basics.

---

## 🚀 Features

- Upload files to AWS S3
- View files in a Google Drive–style grid layout
- Image preview for image files (JPG, PNG, WEBP, etc.)
- Secure file access using AWS S3 pre-signed URLs
- Delete files from cloud storage
- Drag & drop file upload
- Upload status feedback
- Light / Dark mode toggle (persistent)
- Clean and responsive UI

---

## 🛠 Tech Stack

- Backend: Python, Flask
- Frontend: HTML, CSS, JavaScript
- Cloud: AWS S3
- Security: Pre-signed URLs
- UI: CSS Grid, Drag & Drop API

---

## 📁 Project Structure

```
cloudvault/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│
├── README.md
├── .gitignore
```

---

## 🔐 Prerequisites

- Python 3.8+
- AWS Account
- AWS S3 bucket (private)
- IAM user with S3 access

---

## ⚙️ Step-by-Step Setup

### STEP 1: Create an S3 Bucket
1. Go to AWS Console → S3
2. Create a bucket
3. Keep **Block all public access ENABLED**
4. Note the bucket name and region

---

### STEP 2: Create IAM User
1. AWS Console → IAM → Users → Create user
2. Attach policy: `AmazonS3FullAccess`
3. Create access key
4. Save credentials securely

---

### STEP 3: Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Create `.env` file:

```env
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket_name
```

---

### STEP 4: Run Backend

```bash
python app.py
```

Backend runs on:
```
http://localhost:5000
```

---

### STEP 5: Frontend Setup

```bash
cd frontend
python -m http.server 8000
```

Open in browser:
```
http://localhost:8000
```

---

## 🔒 Security Notes

- S3 bucket is private
- Files accessed via temporary pre-signed URLs
- AWS credentials stored using environment variables
- `.env` file is ignored via `.gitignore`

---

## 📚 Learning Outcomes

- AWS S3 basics
- Secure file handling using pre-signed URLs
- REST API integration
- Drag & drop uploads
- UI theming with CSS variables
- Debugging real-world cloud issues

---

## 📜 License

This project is for learning and educational purposes.

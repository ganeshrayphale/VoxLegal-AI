# 🚀 How to Run VoxLegal AI (Complete Guide)

## Prerequisites
* Python 3.10+ (Installed in backend venv)
* Node.js 18+ / npm (For frontend)

---

## 1. Quick Start (Terminal Commands)

Open **two separate terminal windows** from the `Voxlegal_Ai` project folder:

### Terminal 1: Start FastAPI Backend
```powershell
cd .\backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend will be live at: `http://127.0.0.1:8000`
* Interactive Swagger API docs: `http://127.0.0.1:8000/docs`

---

### Terminal 2: Start Vite React Frontend
```powershell
cd .\frontend
npm run dev
```
* Web Dashboard will open at: `http://localhost:5173`

---

## 2. Using the Application

1. Open **`http://localhost:5173`** in Google Chrome or Microsoft Edge (for full Web Speech voice support).
2. **Landing Page**:
   * Click **"Upload a Document"** or **"Try Voice Mode"**.
   * Use **"Try sample"** buttons to test immediate 1-click indexing of pre-loaded employment, commercial, or lease contracts.
3. **Document Ingestion (Upload Screen)**:
   * Drag & drop a PDF (digital or scanned) or an image (`.png`, `.jpg`, `.jpeg`).
   * Click **"Process & Analyze Document"**.
4. **Three-Panel Legal Workspace**:
   * **Left Panel**: Thumbnails of all pages with clause counts.
   * **Center Panel**: High-contrast legal document sheet viewer with section headings and cited clause highlights.
   * **Right Panel**: Chat with evidence citations, verbatim quotes, read-aloud buttons, executive dossier, and clause vector search. Click **"View in Document"** to jump and highlight cited clauses in real time.
5. **Dedicated Voice Mode**:
   * Tap the central animated microphone to speak questions.
   * Audio media controls (Play/Pause, Stop, Repeat).
   * Speech rate & natural Indian English neural voices (`en-IN-NeerjaNeural`, `en-IN-PrabhatNeural`).
6. **Universal Accessibility**:
   * **Low Vision Mode**: Enlarged text, high line-height, and simplified layout.
   * **Text Size**: `A` `A` `A` segmented controls for instant app-wide scaling.
   * **High Contrast**: Stark black/white/forest contrast and high-visibility focus rings.
   * **Keyboard Shortcuts**: `Alt + M` (Toggle Mic), `Alt + S` (Stop Speech).

---

## 3. Deploying a public demo

See [README.md](./README.md) for the Cloud Run deployment steps. The Dockerfile serves both the frontend and API on one service; the Gemini API key must be configured as a Cloud Run secret.

Do not upload confidential or personally identifying documents to a public deployment. The current prototype shares its in-memory document index between visitors and does not provide authentication or per-user data isolation..

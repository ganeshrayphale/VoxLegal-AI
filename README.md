# VoxLegal AI

VoxLegal AI is a React and FastAPI demo for extracting, searching, and discussing clauses in legal documents. It includes a Gemini-powered answer layer, local sentence-embedding search, OCR, and speech synthesis.

## Run locally

See [RUN_GUIDE.md](./RUN_GUIDE.md) for Windows setup and usage. Create `backend/.env` from `backend/.env.example` and set `GEMINI_API_KEY` (or `GCP_API_KEY`) to enable Gemini features.

## Deploy on Google Cloud Run

The included `Dockerfile` builds the React frontend and serves it with the FastAPI backend as one service.

1. Create a Google Cloud project, enable billing, and install/authenticate the Google Cloud CLI.
2. From this repository's root, deploy with:

   ```powershell
   gcloud run deploy voxlegal-ai --source . --region asia-south1 --allow-unauthenticated --memory 2Gi --cpu 2 --concurrency 1 --max-instances 1
   ```

3. In the Cloud Run service's **Edit and deploy new revision** page, add `GEMINI_API_KEY` as a secret-backed environment variable. Do not put the key in source code or commit it.
4. Open the service URL shown by Cloud Run.

Cloud Run has a monthly free usage allowance, but requires a billing account and usage beyond the allowance can incur charges. Set a budget alert and review Cloud Run, Cloud Build, and Artifact Registry pricing before deploying.

## Public-demo and document privacy warning

This app is a prototype, not a secure multi-user legal-document service. The API currently keeps the active clause index in shared process memory and writes uploaded files to local storage. Do not upload confidential or personally identifying documents to a public deployment. Add authentication, per-user document isolation, upload limits, and data retention controls before using it with real client documents.

Uploaded files, generated audio, local model weights, and research artifacts are intentionally excluded from the deploy image and Git ignore rules. Sample documents under `frontend/public/samples/` are bundled for the demo.

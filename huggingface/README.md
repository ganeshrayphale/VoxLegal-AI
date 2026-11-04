# Hugging Face model deployment

The Indian legal model in `backend/models/voxlegal_indian_legal_llm/` is a LoRA adapter, not a standalone checkpoint. It depends on the 8B base model `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`. The adapter weights are intentionally excluded from GitHub.

This folder contains a separate Hugging Face ZeroGPU Space for trying the adapter. It does not connect to the Render-hosted VoxLegal app.

## 1. Create a public model repository

1. Sign in to [Hugging Face](https://huggingface.co/) and create a **public Model** repository, for example `voxlegal-indian-legal-llm`.
2. Before publishing, verify you have the right to publish the adapter and its training data. Review and follow the base model's [Llama 3.1 license](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit).
3. From PowerShell, upload the contents of the local adapter directory (not the whole project):

   ```powershell
   hf auth login
   hf upload YOUR_HF_USERNAME/voxlegal-indian-legal-llm "C:\Users\YOUR_WINDOWS_USERNAME\OneDrive\Attachments\Desktop\AI_CP_NEW\Voxlegal_Ai\backend\models\voxlegal_indian_legal_llm" . --repo-type model
   hf upload YOUR_HF_USERNAME/voxlegal-indian-legal-llm "C:\Users\YOUR_WINDOWS_USERNAME\OneDrive\Attachments\Desktop\AI_CP_NEW\Voxlegal_Ai\huggingface\model-card.md" README.md --repo-type model
   ```

   The first command uploads the adapter configuration/weights and tokenizer files; the second replaces the placeholder training notes with the model-card template. Fill in the training-data and evaluation sections accurately before running the second command. Never put an access token in a command, source file, or public repository. `hf auth login` prompts for it securely.
4. Open the model repository and confirm `adapter_config.json`, `adapter_model.safetensors`, and the tokenizer files are present.

The repository's model card template is [model-card.md](./model-card.md). Complete its training-data and evaluation sections with accurate information before sharing the model.

## 2. Create a free ZeroGPU demo

1. A free personal account can host up to two ZeroGPU Spaces if it is in good standing and is more than 30 days old with a verified email. The free quota is **5 minutes of GPU usage per day**; queue priority and availability can vary. Check the current [ZeroGPU terms and quotas](https://huggingface.co/docs/hub/spaces-zerogpu).
2. Create a **public Space** using the **Gradio** SDK and select **ZeroGPU** hardware.
3. From PowerShell, upload the files from this `space` directory to the root of the Space repository:

   ```powershell
   hf upload YOUR_HF_USERNAME/voxlegal-legal-model-demo "C:\Users\YOUR_WINDOWS_USERNAME\OneDrive\Attachments\Desktop\AI_CP_NEW\Voxlegal_Ai\huggingface\space" . --repo-type space
   ```

   Replace both example usernames with your real Hugging Face username/repository names.
4. In the Space's **Settings > Variables and secrets**, add the variable `MODEL_REPO_ID` with value `YOUR_HF_USERNAME/voxlegal-indian-legal-llm`.
5. Wait for the Space to build, then open its URL and try a short prompt. The model loads at startup; generation uses the daily ZeroGPU quota.

The Space runs only the model prompt demo. It is separate from the VoxLegal document-analysis application and does not provide legal advice. It does not run the FastAPI OCR, retrieval, or Gemini services.

## Free-hosting limits

Render's free web-service instance has 512 MB RAM and cannot run this 8B model. Hugging Face ZeroGPU can provide free, quota-limited GPU time for a Gradio demo, but the current React/FastAPI VoxLegal app is not deployed inside this Space. Connecting these services would require additional integration.

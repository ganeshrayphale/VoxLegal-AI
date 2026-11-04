# ─────────────────────────────────────────────────────────────────────────────
# VoxLegal AI — Fine-Tuned Indian Legal LLM Layer
# Loads the QLoRA fine-tuned model and generates draft legal analysis
# before passing to Gemini for final refinement.
# ─────────────────────────────────────────────────────────────────────────────

import os
import json
from typing import List, Dict, Any, Optional
from pathlib import Path

_legal_llm = None
_tokenizer = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "voxlegal_indian_legal_llm")
_HF_REPO = os.getenv("INDIAN_LEGAL_LLM_HF_REPO", "")


def is_model_available() -> bool:
    """Check if the fine-tuned model weights exist."""
    if _legal_llm is not None:
        return True
    adapter_file = os.path.join(_MODEL_PATH, "adapter_config.json")
    if os.path.isfile(adapter_file):
        return True
    if _HF_REPO:
        return True
    return False


def _load_legal_llm():
    """Lazy-load the fine-tuned Indian Legal LLM on first use."""
    global _legal_llm, _tokenizer

    if _legal_llm is not None:
        return _legal_llm, _tokenizer

    if not is_model_available():
        print("[Legal LLM] Fine-tuned Indian Legal LLM not found. Using Gemini-only mode.")
        return None, None

    model_src = _MODEL_PATH if os.path.isfile(os.path.join(_MODEL_PATH, "adapter_config.json")) else _HF_REPO

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import PeftModel

        has_cuda = torch.cuda.is_available()
        print(f"[Legal LLM] Initializing model (CUDA available: {has_cuda})...")

        # Load Tokenizer
        _tokenizer = AutoTokenizer.from_pretrained(model_src, trust_remote_code=True)
        if _tokenizer.pad_token is None:
            _tokenizer.pad_token = _tokenizer.eos_token

        adapter_config_path = os.path.join(model_src, "adapter_config.json")
        with open(adapter_config_path, "r", encoding="utf-8") as f:
            adapter_config = json.load(f)
        base_model_name = adapter_config.get("base_model_name_or_path", "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit")

        if has_cuda:
            # GPU Mode: Fast 4-bit NF4 quantized inference
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
            )
            base_model = AutoModelForCausalLM.from_pretrained(
                base_model_name,
                quantization_config=bnb_config,
                device_map="auto",
                trust_remote_code=True,
            )
            _legal_llm = PeftModel.from_pretrained(base_model, model_src)
            _legal_llm.eval()
            print("✅ [Legal LLM] Fine-tuned Indian Legal LLM loaded in GPU VRAM (4-bit)!")
        else:
            # CPU Mode: 8B LLM requires ~16GB RAM for raw weights on CPU.
            # To protect system responsiveness on laptops without discrete GPU:
            allow_cpu = os.getenv("ALLOW_CPU_LLM_LOAD", "false").lower() == "true"
            if allow_cpu:
                print("[Legal LLM] Loading base model on CPU (ALLOW_CPU_LLM_LOAD=true)...")
                base_model = AutoModelForCausalLM.from_pretrained(
                    base_model_name,
                    torch_dtype=torch.float32,
                    low_cpu_mem_usage=True,
                    device_map="cpu",
                    trust_remote_code=True,
                )
                _legal_llm = PeftModel.from_pretrained(base_model, model_src)
                _legal_llm.eval()
                print("✅ [Legal LLM] Fine-tuned Indian Legal LLM loaded on CPU!")
            else:
                print("ℹ️ [Legal LLM] Model adapter weights verified in backend/models.")
                print("             Running in hybrid mode (Statutory reasoning + Gemini Grounding layer).")
                print("             (To force full 8B model CPU execution, set ALLOW_CPU_LLM_LOAD=true in .env)")
                return None, _tokenizer

        return _legal_llm, _tokenizer

    except Exception as e:
        print(f"[Legal LLM] Model loading notice: {e}")
        return None, None


def generate_legal_draft(query: str, context: str, max_new_tokens: int = 350) -> Optional[str]:
    """
    Generate a preliminary legal analysis using the fine-tuned Indian Legal model.
    """
    model, tokenizer = _load_legal_llm()
    if model is None or tokenizer is None:
        return None

    try:
        import torch

        system_prompt = (
            "You are an expert Indian legal analyst. You have deep knowledge of Indian law "
            "including the Indian Contract Act, Indian Penal Code (IPC), Code of Civil Procedure (CPC), "
            "and Indian Supreme Court precedents.\n\n"
            "Analyze the following legal clauses and answer the user's question. "
            "Cite relevant Indian statutory sections where applicable."
        )

        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

LEGAL DOCUMENT CONTEXT:
{context[:3500]}

QUESTION: {query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""

        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=2048)
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=0.2,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )

        generated_tokens = outputs[0][inputs["input_ids"].shape[1]:]
        draft = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()
        print(f"[Legal LLM] Generated preliminary legal assessment ({len(draft)} chars)")
        return draft

    except Exception as e:
        print(f"[Legal LLM] Generation exception: {e}")
        return None

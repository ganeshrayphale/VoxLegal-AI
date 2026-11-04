import os

import gradio as gr
import spaces
import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_REPO_ID = os.getenv("MODEL_REPO_ID")
BASE_MODEL_ID = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit"

if not MODEL_REPO_ID:
    raise RuntimeError("Set the MODEL_REPO_ID variable in the Space settings.")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_REPO_ID,
    trust_remote_code=True,
)
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_ID,
    device_map="auto",
    trust_remote_code=True,
)
model = PeftModel.from_pretrained(base_model, MODEL_REPO_ID)
model.eval()


@spaces.GPU(duration=120)
def generate_answer(prompt: str) -> str:
    if not prompt.strip():
        raise gr.Error("Enter a question or prompt.")

    inputs = tokenizer.apply_chat_template(
        [{"role": "user", "content": prompt.strip()}],
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt",
        return_dict=True,
    ).to("cuda")

    with torch.inference_mode():
        output = model.generate(
            **inputs,
            max_new_tokens=256,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
        )

    new_tokens = output[0, inputs["input_ids"].shape[1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True).strip()


demo = gr.Interface(
    fn=generate_answer,
    inputs=gr.Textbox(
        label="Prompt",
        lines=4,
        placeholder="Enter a short prompt for the model.",
    ),
    outputs=gr.Textbox(label="Model response", lines=8),
    title="VoxLegal Indian Legal Model Demo",
    description=(
        "Research/demo only. Model responses may be incorrect and are not legal advice. "
        "GPU use is subject to Hugging Face ZeroGPU availability and quotas."
    ),
)

if __name__ == "__main__":
    demo.launch()

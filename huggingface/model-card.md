---
base_model: unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
library_name: peft
pipeline_tag: text-generation
tags:
- lora
- indian-legal
license: llama3.1
---

# VoxLegal Indian Legal LLM adapter

This repository contains a LoRA adapter fine-tuned from `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`. It is not a standalone model: load it with the base model using PEFT and Transformers.

## Intended use and limitations

Describe the intended use, languages, known limitations, and safety considerations here. Model output can be inaccurate and must not be treated as legal advice.

## Training data and evaluation

Before publishing, replace this section with an accurate description of the training data and its license/permissions, training process, and evaluation results. Do not publish private, copyrighted, or otherwise unauthorized data.

## License

This adapter is based on Meta Llama 3.1. Review and comply with the applicable [Llama 3.1 Community License](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit) and applicable terms before redistribution.

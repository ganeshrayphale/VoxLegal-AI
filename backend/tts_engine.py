# ─────────────────────────────────────────────────────────────────────────────
# VoxLegal AI — Edge TTS Engine
# Uses Microsoft Edge's free neural TTS voices for natural human-like speech.
# Supports Indian English (en-IN) and US English (en-US) voices.
# ─────────────────────────────────────────────────────────────────────────────

import edge_tts
import asyncio
import uuid
import os
import re
from pathlib import Path

# Audio output directory
AUDIO_DIR = Path("audio_cache")
AUDIO_DIR.mkdir(exist_ok=True)

# Available voices (Natural Neural voices — free, no API key needed)
VOICES = {
    "neerja": "en-IN-NeerjaNeural",       # Indian English, Female, warm
    "prabhat": "en-IN-PrabhatNeural",      # Indian English, Male, clear
    "jenny": "en-US-JennyNeural",          # US English, Female, natural
    "guy": "en-US-GuyNeural",              # US English, Male, natural
}

DEFAULT_VOICE = "en-IN-NeerjaNeural"


def clean_text_for_speech(text: str) -> str:
    """Clean markdown and special characters for natural speech."""
    # Remove markdown bold/italic
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    # Remove markdown headers
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    # Remove markdown links [text](url) → text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove markdown bullets
    text = re.sub(r'^[\-\*]\s+', '', text, flags=re.MULTILINE)
    # Remove note parentheticals
    text = re.sub(r'\(Note:.*?\)\.?', '', text, flags=re.DOTALL)
    # Clean extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


async def _generate_speech_async(text: str, voice: str = DEFAULT_VOICE, rate: str = "+0%") -> str:
    """Generate speech audio file from text using Edge TTS."""
    cleaned_text = clean_text_for_speech(text)
    if not cleaned_text:
        return None

    # Truncate very long text to avoid timeout (max ~3000 chars)
    if len(cleaned_text) > 3000:
        cleaned_text = cleaned_text[:3000] + "... That is the end of the summary."

    filename = f"speech_{uuid.uuid4().hex[:12]}.mp3"
    filepath = AUDIO_DIR / filename

    communicate = edge_tts.Communicate(cleaned_text, voice, rate=rate)
    await communicate.save(str(filepath))

    return str(filepath)


def generate_speech(text: str, voice: str = DEFAULT_VOICE, rate: str = "+0%") -> str:
    """
    Synchronous wrapper for Edge TTS speech generation.

    Args:
        text: The text to convert to speech
        voice: Voice name (e.g., 'en-IN-NeerjaNeural')
        rate: Speech rate adjustment (e.g., '+10%', '-10%', '+0%')

    Returns:
        Path to the generated MP3 file, or None if failed.
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_generate_speech_async(text, voice, rate))
        loop.close()
        return result
    except Exception as e:
        print(f"[TTS Engine] Speech generation error: {e}")
        return None


def cleanup_old_audio(max_files: int = 50):
    """Remove old audio files to prevent disk buildup."""
    files = sorted(AUDIO_DIR.glob("speech_*.mp3"), key=os.path.getmtime)
    if len(files) > max_files:
        for f in files[:len(files) - max_files]:
            try:
                f.unlink()
            except Exception:
                pass

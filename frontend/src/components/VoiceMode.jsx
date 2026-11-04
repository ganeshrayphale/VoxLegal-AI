import { useState } from "react";
import {
  MicIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  RepeatIcon,
} from "./Icons";

export default function VoiceMode({
  docInfo,
  listening,
  onToggleListening,
  speaking,
  onStopSpeaking,
  onSpeakText,
  lastAnswer,
  inputQuestion,
  setInputQuestion,
  onAskQuestion,
  asking,
  selectedVoice,
  setSelectedVoice,
}) {
  const [readingSpeed, setReadingSpeed] = useState("Normal");

  const voiceSuggestions = [
    "What is the notice period?",
    "Summarize the key terms.",
    "What are my rights?",
    "What are the grounds for termination?",
    "Is there a non-compete clause?",
  ];

  const handleSuggestion = (prompt) => {
    setInputQuestion(prompt);
    onAskQuestion(prompt);
  };

  const getStatusText = () => {
    if (listening) return "Listening to your voice...";
    if (asking) return "Searching document & analyzing clauses...";
    if (speaking) return "Speaking verified legal answer...";
    return "Tap microphone to speak";
  };

  return (
    <div className="voice-mode-screen">
      <div className="voice-mode-header">
        <h1 className="voice-main-title">Voice Mode</h1>
        <p className="voice-subtitle">
          Speak your question and listen to the answer in natural, evidence-grounded speech.
        </p>
      </div>

      <div className="voice-layout-grid">
        {/* CENTER INTERACTIVE VOICE POD */}
        <div className="voice-center-card">
          {/* Animated Pulsing Mic Pod */}
          <div className="mic-interactive-stage">
            <div
              className={`mic-ripple-ring outer ${listening ? "anim-pulse" : ""} ${speaking ? "anim-speaking" : ""}`}
            />
            <div
              className={`mic-ripple-ring middle ${listening ? "anim-pulse delay" : ""}`}
            />
            <button
              className={`mic-primary-circle-btn ${listening ? "is-listening" : ""} ${speaking ? "is-speaking" : ""}`}
              onClick={onToggleListening}
              aria-label={listening ? "Stop listening" : "Tap to speak question"}
            >
              <MicIcon size={44} />
            </button>
          </div>

          <div className="voice-state-caption">
            <span className="caption-primary">{getStatusText()}</span>
            {docInfo && (
              <span className="caption-sub">
                Active document: <strong>{docInfo.filename}</strong>
              </span>
            )}
          </div>

          {/* Transcript / Spoken Text Display */}
          {(inputQuestion || lastAnswer) && (
            <div className="voice-transcript-bubble" aria-live="polite">
              {inputQuestion && (
                <div className="transcript-query">
                  <span className="transcript-label">You said:</span>
                  <p className="transcript-text">"{inputQuestion}"</p>
                </div>
              )}

              {lastAnswer && (
                <div className="transcript-answer">
                  <span className="transcript-label">Answer:</span>
                  <p className="transcript-text">{lastAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Audio Media & Voice Controls Bar (From Mockup) */}
          <div className="voice-controls-bar">
            {/* Status Pill */}
            <div className={`status-pill ${listening ? "listening" : speaking ? "speaking" : "idle"}`}>
              <span className="status-indicator-dot" />
              <span>{listening ? "Listening..." : speaking ? "Speaking..." : "Ready"}</span>
            </div>

            {/* Media Action Buttons */}
            <div className="media-buttons-group">
              <button
                className="btn-media-ctrl"
                onClick={() => lastAnswer && onSpeakText(lastAnswer)}
                disabled={!lastAnswer}
                title="Repeat last answer"
                aria-label="Repeat last answer"
              >
                <RepeatIcon size={18} />
              </button>

              <button
                className="btn-media-ctrl main"
                onClick={() => {
                  if (speaking) {
                    onStopSpeaking();
                  } else if (lastAnswer) {
                    onSpeakText(lastAnswer);
                  }
                }}
                disabled={!lastAnswer}
                title={speaking ? "Pause speech" : "Play speech"}
                aria-label={speaking ? "Pause speech" : "Play speech"}
              >
                {speaking ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
              </button>

              <button
                className="btn-media-ctrl"
                onClick={onStopSpeaking}
                disabled={!speaking}
                title="Stop speech"
                aria-label="Stop speech"
              >
                <StopIcon size={18} />
              </button>
            </div>

            {/* Voice & Speed Dropdowns */}
            <div className="voice-selectors-row">
              <div className="selector-item">
                <label htmlFor="voice-select-dropdown" className="selector-label">Voice:</label>
                <select
                  id="voice-select-dropdown"
                  className="voice-mini-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  <option value="en-IN-NeerjaNeural">Neerja (Indian English)</option>
                  <option value="en-IN-PrabhatNeural">Prabhat (Indian English)</option>
                  <option value="en-US-JennyNeural">Jenny (US English)</option>
                  <option value="en-US-GuyNeural">Guy (US English)</option>
                </select>
              </div>

              <div className="selector-item">
                <label htmlFor="speed-select-dropdown" className="selector-label">Speed:</label>
                <select
                  id="speed-select-dropdown"
                  className="voice-mini-select"
                  value={readingSpeed}
                  onChange={(e) => setReadingSpeed(e.target.value)}
                >
                  <option value="0.75x">0.75x</option>
                  <option value="Normal">Normal</option>
                  <option value="1.25x">1.25x</option>
                  <option value="1.5x">1.5x</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE SUGGESTIONS CARD (From Mockup) */}
        <div className="voice-suggestions-card">
          <h2 className="suggestions-heading">You can say:</h2>
          <div className="suggestions-list">
            {voiceSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                className="voice-suggestion-item"
                onClick={() => handleSuggestion(prompt)}
                disabled={asking || listening}
              >
                <span className="quote-icon">“</span>
                <span className="suggestion-text">{prompt}</span>
                <span className="quote-icon">”</span>
              </button>
            ))}
          </div>

          <div className="voice-tip-box">
            <strong>Voice Tip:</strong> Speak naturally into your microphone. You can say{" "}
            <em>"Summarize document"</em>, <em>"What is the notice period?"</em>, or ask about any clause number.
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileTextIcon,
  MicIcon,
  SendIcon,
  Volume2Icon,
  ShareIcon,
  EyeIcon,
} from "./Icons";

export default function DocumentWorkspace({
  docInfo,
  chatHistory,
  onAskQuestion,
  asking,
  inputQuestion,
  setInputQuestion,
  listening,
  onToggleListening,
  onSpeakText,
  onSummarizeClick,
}) {
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);
  const chatBottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, asking]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAskQuestion();
    }
  };

  const samplePrompts = [
    "What is the probation period in this agreement?",
    "What are the conditions and notice period for termination?",
    "What are the key obligations and liabilities?",
    "What is the governing law and seat of dispute resolution?",
    "Are there any restrictive covenants or non-compete clauses?",
  ];

  return (
    <div className="workspace-chat-all-container">
      {/* ── TOP WORKSPACE HEADER ── */}
      <header className="workspace-chat-header" aria-label="Document Chat Header">
        <div className="header-left-group">
          <div className="doc-icon-circle" aria-hidden="true">
            <FileTextIcon size={20} />
          </div>
          <div className="doc-meta-text">
            <div className="doc-title-row">
              <h1 className="doc-active-name" title={docInfo?.filename}>
                {docInfo?.filename || "Active Document"}
              </h1>
              <span className="doc-pill-type">
                {docInfo?.summary?.document_type || "Legal Agreement"}
              </span>
            </div>
            <div className="doc-stats-line">
              <span>{docInfo?.total_pages || 1} Pages</span>
              <span className="dot-divider">•</span>
              <span>{docInfo?.total_clauses || 0} Clauses Indexed</span>
              <span className="dot-divider">•</span>
              <span className="grounded-note">Verified RAG Ready</span>
            </div>
          </div>
        </div>

        <div className="header-right-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onSummarizeClick}
            title="Generate executive legal summary"
          >
            <span>⚡ Summarize Document</span>
          </button>

          <button
            className={`btn btn-secondary btn-sm ${showInsightsDrawer ? "active-toggle" : ""}`}
            onClick={() => setShowInsightsDrawer(!showInsightsDrawer)}
            title="Toggle Executive Dossier & Insights"
          >
            <EyeIcon size={14} />
            <span>Key Insights</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("Document workspace link copied to clipboard.");
            }}
            title="Share Document Link"
          >
            <ShareIcon size={14} />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CHAT CANVAS ── */}
      <div className="workspace-chat-body">
        <main className="chat-messages-stage" role="log" aria-label="Conversation with document">
          {chatHistory.length === 0 ? (
            <div className="chat-welcome-hero">
              <div className="welcome-avatar-icon" aria-hidden="true">
                ⚖
              </div>
              <h2 className="welcome-headline">
                Ask anything about {docInfo?.filename}
              </h2>
              <p className="welcome-sub">
                VoxLegal AI provides factual, evidence-grounded answers strictly based on this document.
                Every response cites the exact page and clause number.
              </p>

              <div className="starter-prompts-wrapper">
                <span className="starter-label">Suggested questions:</span>
                <div className="starter-prompts-grid">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="starter-prompt-card"
                      onClick={() => onAskQuestion(prompt)}
                      disabled={asking}
                    >
                      <span className="prompt-sparkle" aria-hidden="true">💬</span>
                      <span className="prompt-text">"{prompt}"</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-thread-container">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-message-row ${msg.sender}`}>
                  {msg.sender === "user" ? (
                    <div className="user-bubble">
                      <div className="user-bubble-text">{msg.text}</div>
                    </div>
                  ) : (
                    <div className="assistant-card-full">
                      <div className="assistant-card-topbar">
                        <div className="assistant-brand-badge">
                          <span className="scales-small-icon" aria-hidden="true">⚖</span>
                          <span className="assistant-label">VoxLegal AI</span>
                        </div>

                        <div className="assistant-top-actions">
                          {msg.is_grounded && (
                            <span className="grounded-check-tag">
                              ✓ Grounded in Document
                            </span>
                          )}

                          {msg.text && (
                            <button
                              className="btn-speech-trigger"
                              onClick={() => onSpeakText(msg.text)}
                              title="Listen to this legal answer"
                              aria-label="Listen to answer"
                            >
                              <Volume2Icon size={16} />
                              <span>Listen</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="assistant-answer-prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>

                      {/* Clean Clause Citations Row (Mentions only clause number & page) */}
                      {msg.evidence && msg.evidence.length > 0 && (
                        <div className="citations-chips-row" aria-label="Referenced Clauses">
                          <span className="citations-label">📌 Citations:</span>
                          {msg.evidence.map((ev, evIdx) => (
                            <span key={evIdx} className="clause-citation-tag">
                              Clause {ev.clause} (Page {ev.page})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {asking && (
                <div className="assistant-loading-state">
                  <div className="spinner" />
                  <span>Searching document vectors &amp; verifying legal provisions...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          )}
        </main>

        {/* ── FIXED BOTTOM CHAT COMPOSER ── */}
        <div className="chat-composer-sticky">
          <div className="chat-composer-inner">
            <div className={`composer-input-pill ${listening ? "listening-mode" : ""}`}>
              <button
                className={`btn-voice-input ${listening ? "is-active" : ""}`}
                onClick={onToggleListening}
                title={listening ? "Stop listening" : "Click to speak your question"}
                aria-label={listening ? "Stop listening" : "Speak question"}
              >
                <MicIcon size={20} />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                className="composer-textarea"
                placeholder={
                  listening
                    ? "Listening... Speak your legal question"
                    : "Ask any question about this document (or use voice)..."
                }
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={asking}
              />

              <button
                className="btn-send-question"
                onClick={() => onAskQuestion()}
                disabled={asking || !inputQuestion.trim()}
                aria-label="Send question"
              >
                <SendIcon size={18} />
              </button>
            </div>

            <div className="composer-footer-hints">
              <span>Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line.</span>
              <span>Voice shortcut: <kbd>Alt + M</kbd></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── OPTIONAL SLIDE-OVER DRAWER FOR KEY INSIGHTS ── */}
      {showInsightsDrawer && (
        <aside className="insights-drawer-panel" aria-label="Executive Legal Dossier">
          <div className="drawer-header">
            <div className="drawer-title-group">
              <h2 className="drawer-title">Executive Dossier</h2>
              <span className="drawer-sub">{docInfo?.summary?.document_type || "Legal Analysis"}</span>
            </div>
            <button
              className="btn-close-drawer"
              onClick={() => setShowInsightsDrawer(false)}
              aria-label="Close Key Insights drawer"
            >
              ✕
            </button>
          </div>

          <div className="drawer-scroll-body">
            {docInfo?.summary ? (
              <div className="drawer-dossier-stack">
                <div className="dossier-card">
                  <h3 className="dossier-card-title">Executive Summary</h3>
                  <p className="dossier-card-text">{docInfo.summary.executive_summary}</p>
                </div>

                {docInfo.summary.parties_involved?.length > 0 && (
                  <div className="dossier-card">
                    <h3 className="dossier-card-title">Parties Involved</h3>
                    <ul className="dossier-card-list">
                      {docInfo.summary.parties_involved.map((party, i) => (
                        <li key={i}>{party}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {docInfo.summary.key_conditions?.length > 0 && (
                  <div className="dossier-card">
                    <h3 className="dossier-card-title">Key Provisions &amp; Conditions</h3>
                    <ul className="dossier-card-list">
                      {docInfo.summary.key_conditions.map((cond, i) => (
                        <li key={i}>{cond}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {docInfo.summary.termination_and_penalties && (
                  <div className="dossier-card alert">
                    <h3 className="dossier-card-title">Termination &amp; Penalties</h3>
                    <p className="dossier-card-text">{docInfo.summary.termination_and_penalties}</p>
                  </div>
                )}

                {docInfo.summary.governing_law_and_disputes && (
                  <div className="dossier-card">
                    <h3 className="dossier-card-title">Governing Law &amp; Jurisdiction</h3>
                    <p className="dossier-card-text">{docInfo.summary.governing_law_and_disputes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="drawer-empty-state">
                <p>No executive summary generated yet.</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowInsightsDrawer(false);
                    onSummarizeClick();
                  }}
                  style={{ marginTop: 12 }}
                >
                  Generate Summary Now
                </button>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

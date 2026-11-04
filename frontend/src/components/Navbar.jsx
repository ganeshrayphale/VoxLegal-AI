import { useState } from "react";
import { ScalesIcon, MicIcon, UploadCloudIcon, EyeIcon } from "./Icons";

export default function Navbar({
  currentView,
  setCurrentView,
  speaking,
  stopSpeaking,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "landing", label: "Home" },
    { id: "workspace", label: "Workspace" },
    { id: "voice", label: "Voice Mode" },
    { id: "documents", label: "Documents" },
    { id: "accessibility", label: "Accessibility" },
  ];

  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        {/* Brand */}
        <div
          className="brand-link"
          onClick={() => setCurrentView("landing")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setCurrentView("landing");
          }}
          aria-label="VoxLegal AI - Return to Homepage"
        >
          <div className="brand-logo-badge" aria-hidden="true">
            <ScalesIcon size={22} />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">VoxLegal AI</span>
            <span className="brand-badge-tag">Evidence Grounded</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`nav-item ${currentView === link.id ? "active" : ""}`}
              onClick={() => setCurrentView(link.id)}
              aria-current={currentView === link.id ? "page" : undefined}
            >
              {link.id === "voice" && <MicIcon size={15} className="nav-icon-inline" />}
              {link.id === "accessibility" && <EyeIcon size={15} className="nav-icon-inline" />}
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        {/* Status & Actions */}
        <div className="header-actions">
          {/* Speaking Indicator */}
          {speaking && (
            <div className="speaking-status-pill" role="status" aria-live="polite">
              <span className="pulse-dot" />
              <span className="speaking-text">Speaking</span>
              <button
                className="btn-stop-speech"
                onClick={stopSpeaking}
                title="Stop Speech Playback (Alt+S)"
                aria-label="Stop audio reading"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Upload CTA button */}
          {currentView !== "upload" && (
            <button
              className="btn btn-primary btn-header-cta"
              onClick={() => setCurrentView("upload")}
              aria-label="Upload a legal document"
            >
              <UploadCloudIcon size={16} />
              <span>Upload Document</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <nav className="mobile-nav-links">
            {navLinks.map((link) => (
              <button
                key={link.id}
                className={`mobile-nav-link ${currentView === link.id ? "active" : ""}`}
                onClick={() => {
                  setCurrentView(link.id);
                  setMobileMenuOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              className="mobile-nav-link cta"
              onClick={() => {
                setCurrentView("upload");
                setMobileMenuOpen(false);
              }}
            >
              Upload Document
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

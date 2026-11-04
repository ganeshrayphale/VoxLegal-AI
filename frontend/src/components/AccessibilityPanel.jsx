import {
  EyeIcon,
  TypeIcon,
  ContrastIcon,
  MicIcon,
  KeyboardIcon,
} from "./Icons";
import { useAccessibility } from "../context/AccessibilityContext";

export default function AccessibilityPanel() {
  const {
    lowVision,
    setLowVision,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    voiceAssistance,
    setVoiceAssistance,
    keyboardNav,
    setKeyboardNav,
    reducedMotion,
    setReducedMotion,
  } = useAccessibility();

  const shortcuts = [
    { key: "Alt + M", desc: "Toggle Microphone Speech Input" },
    { key: "Alt + S", desc: "Stop Active Audio Reading" },
    { key: "Enter", desc: "Submit Question in Chat" },
    { key: "Tab", desc: "Navigate Through Interactive Elements" },
  ];

  return (
    <div className="accessibility-screen-wrap">
      <div className="accessibility-header-row">
        <h1 className="access-main-title">Accessibility</h1>
        <p className="access-subtitle">Customize your experience for maximum visual comfort and control.</p>
      </div>

      <div className="accessibility-card-container">
        {/* ROW 1: LOW VISION MODE */}
        <div className="access-setting-row">
          <div className="setting-icon-col" aria-hidden="true">
            <EyeIcon size={24} />
          </div>
          <div className="setting-info-col">
            <h2 className="setting-title">Low Vision Mode</h2>
            <p className="setting-desc">Larger text, higher contrast, generous line spacing, and simplified layouts.</p>
          </div>
          <div className="setting-action-col">
            <button
              type="button"
              className={`toggle-switch-ios ${lowVision ? "active" : ""}`}
              onClick={() => setLowVision(!lowVision)}
              role="switch"
              aria-checked={lowVision}
              aria-label="Toggle Low Vision Mode"
            >
              <span className="switch-thumb" />
            </button>
          </div>
        </div>

        {/* ROW 2: TEXT SIZE */}
        <div className="access-setting-row">
          <div className="setting-icon-col" aria-hidden="true">
            <TypeIcon size={24} />
          </div>
          <div className="setting-info-col">
            <h2 className="setting-title">Text Size</h2>
            <p className="setting-desc">Adjust text size across the entire application.</p>
          </div>
          <div className="setting-action-col">
            <div className="text-size-segmented" role="radiogroup" aria-label="Text Size Selection">
              <button
                type="button"
                className={`size-segment-btn ${textSize === "normal" ? "active" : ""}`}
                onClick={() => setTextSize("normal")}
                role="radio"
                aria-checked={textSize === "normal"}
                title="Normal Font Size"
              >
                <span style={{ fontSize: 13 }}>A</span>
              </button>
              <button
                type="button"
                className={`size-segment-btn ${textSize === "large" ? "active" : ""}`}
                onClick={() => setTextSize("large")}
                role="radio"
                aria-checked={textSize === "large"}
                title="Large Font Size"
              >
                <span style={{ fontSize: 16, fontWeight: 600 }}>A</span>
              </button>
              <button
                type="button"
                className={`size-segment-btn ${textSize === "xlarge" ? "active" : ""}`}
                onClick={() => setTextSize("xlarge")}
                role="radio"
                aria-checked={textSize === "xlarge"}
                title="Extra Large Font Size"
              >
                <span style={{ fontSize: 19, fontWeight: 700 }}>A</span>
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: HIGH CONTRAST */}
        <div className="access-setting-row">
          <div className="setting-icon-col" aria-hidden="true">
            <ContrastIcon size={24} />
          </div>
          <div className="setting-info-col">
            <h2 className="setting-title">High Contrast</h2>
            <p className="setting-desc">Increase contrast for better visibility on all screens and lighting.</p>
          </div>
          <div className="setting-action-col">
            <button
              type="button"
              className={`toggle-switch-ios ${highContrast ? "active" : ""}`}
              onClick={() => setHighContrast(!highContrast)}
              role="switch"
              aria-checked={highContrast}
              aria-label="Toggle High Contrast Mode"
            >
              <span className="switch-thumb" />
            </button>
          </div>
        </div>

        {/* ROW 4: VOICE ASSISTANCE */}
        <div className="access-setting-row">
          <div className="setting-icon-col" aria-hidden="true">
            <MicIcon size={24} />
          </div>
          <div className="setting-info-col">
            <h2 className="setting-title">Voice Assistance</h2>
            <p className="setting-desc">Enable speech input, voice recognition, and auto-read audio responses.</p>
          </div>
          <div className="setting-action-col">
            <button
              type="button"
              className={`toggle-switch-ios ${voiceAssistance ? "active" : ""}`}
              onClick={() => setVoiceAssistance(!voiceAssistance)}
              role="switch"
              aria-checked={voiceAssistance}
              aria-label="Toggle Voice Assistance"
            >
              <span className="switch-thumb" />
            </button>
          </div>
        </div>

        {/* ROW 5: KEYBOARD NAVIGATION */}
        <div className="access-setting-row">
          <div className="setting-icon-col" aria-hidden="true">
            <KeyboardIcon size={24} />
          </div>
          <div className="setting-info-col">
            <h2 className="setting-title">Keyboard Navigation</h2>
            <p className="setting-desc">Optimized focus rings, landmark navigation, and keyboard shortcuts.</p>
          </div>
          <div className="setting-action-col">
            <button
              type="button"
              className={`toggle-switch-ios ${keyboardNav ? "active" : ""}`}
              onClick={() => setKeyboardNav(!keyboardNav)}
              role="switch"
              aria-checked={keyboardNav}
              aria-label="Toggle Keyboard Navigation Mode"
            >
              <span className="switch-thumb" />
            </button>
          </div>
        </div>

        {/* ROW 6: REDUCED MOTION */}
        <div className="access-setting-row">
          <div className="setting-icon-col" aria-hidden="true">
            <EyeIcon size={24} />
          </div>
          <div className="setting-info-col">
            <h2 className="setting-title">Reduced Motion</h2>
            <p className="setting-desc">Disable decorative transitions, pulsing rings, and animated waves.</p>
          </div>
          <div className="setting-action-col">
            <button
              type="button"
              className={`toggle-switch-ios ${reducedMotion ? "active" : ""}`}
              onClick={() => setReducedMotion(!reducedMotion)}
              role="switch"
              aria-checked={reducedMotion}
              aria-label="Toggle Reduced Motion"
            >
              <span className="switch-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* SHORTCUTS REFERENCE CARD */}
      <div className="shortcuts-reference-card">
        <h2 className="shortcuts-title">Keyboard Shortcuts Reference</h2>
        <div className="shortcuts-grid">
          {shortcuts.map((sc, i) => (
            <div key={i} className="shortcut-row">
              <kbd className="kbd-badge">{sc.key}</kbd>
              <span className="shortcut-desc">{sc.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

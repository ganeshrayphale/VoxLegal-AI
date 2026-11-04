import {
  UploadCloudIcon,
  MicIcon,
  ScalesIcon,
  ShieldCheckIcon,
  EyeIcon,
  FileTextIcon,
} from "./Icons";

export default function LandingPage({ onUploadClick, onVoiceClick, onSampleClick }) {
  const whyPoints = [
    {
      icon: <FileTextIcon size={22} />,
      title: "AI-Powered Legal Understanding",
      desc: "Get clear, plain-language explanations from contracts and legal deeds with verbatim citations.",
    },
    {
      icon: <MicIcon size={22} />,
      title: "Voice Enabled",
      desc: "Speak your questions naturally and listen to human-like neural audio answers.",
    },
    {
      icon: <EyeIcon size={22} />,
      title: "Accessible Design",
      desc: "Built ground-up with Low Vision mode, high contrast, and keyboard navigation support.",
    },
    {
      icon: <ShieldCheckIcon size={22} />,
      title: "Secure & Private",
      desc: "Documents are processed locally with in-memory FAISS vector indexing and zero data leakage.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Your Document",
      desc: "Drag & drop commercial contracts, employment agreements, or rent deeds in digital PDF or scanned image format.",
    },
    {
      num: "02",
      title: "Ask by Voice or Text",
      desc: "Ask questions like 'What is the notice period?' or 'Are there termination penalties?' in simple everyday language.",
    },
    {
      num: "03",
      title: "Verify Source Citations",
      desc: "Inspect the exact page number, clause number, and highlighted excerpt in the interactive document viewer.",
    },
  ];

  return (
    <div className="landing-page-wrap">
      {/* ── HERO SECTION ── */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-content">
          <div className="hero-text-col">
            <div className="hero-kicker">
              <span className="kicker-pill">AI-Powered Legal Tech</span>
              <span className="kicker-note">Evidence-Grounded Intelligence</span>
            </div>

            <h1 id="hero-heading" className="hero-title">
              Understand Legal Documents with AI, Powered by Your Voice.
            </h1>

            <p className="hero-description">
              VoxLegal AI helps you read, understand, and ask questions about legal documents — with
              accurate, evidence-backed answers. Designed for everyone, including visually impaired
              users.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <button
                className="btn btn-primary btn-hero"
                onClick={onUploadClick}
                aria-label="Upload a legal document to begin"
              >
                <UploadCloudIcon size={18} />
                <span>Upload a Document</span>
              </button>

              <button
                className="btn btn-secondary btn-hero"
                onClick={onVoiceClick}
                aria-label="Try voice mode"
              >
                <MicIcon size={18} />
                <span>Try Voice Mode</span>
              </button>
            </div>

            {/* Sample document pills for instant 1-click test */}
            <div className="hero-samples-row">
              <span className="samples-label">Try sample:</span>
              <button
                className="sample-pill-link"
                onClick={() => onSampleClick("Sample_Employment_Contract.png")}
              >
                Employment Contract
              </button>
              <button
                className="sample-pill-link"
                onClick={() => onSampleClick("Indian_Commercial_Services_Agreement.pdf")}
              >
                Commercial Agreement
              </button>
              <button
                className="sample-pill-link"
                onClick={() => onSampleClick("Sample_Rent_Agreement.pdf")}
              >
                Rental Agreement
              </button>
            </div>
          </div>

          {/* Hero Visual Card with Scales & Quote */}
          <div className="hero-visual-col" aria-hidden="true">
            <div className="hero-card-composition">
              <div className="hero-scales-art">
                <div className="scales-circle-backdrop">
                  <ScalesIcon size={72} className="hero-scales-icon" />
                </div>
              </div>

              {/* Floating Quote Card */}
              <div className="hero-quote-card">
                <div className="quote-mark">“</div>
                <div className="quote-text">
                  Making the law understandable for everyone.
                </div>
                <div className="quote-accent-bar" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Badges Bar */}
        <div className="hero-badges-bar" role="list" aria-label="Key system capabilities">
          <div className="hero-badge-item" role="listitem">
            <span className="badge-bullet">🔍</span>
            <span>Ask questions in simple language</span>
          </div>
          <div className="hero-badge-item" role="listitem">
            <span className="badge-bullet">📑</span>
            <span>Get answers with page &amp; clause references</span>
          </div>
          <div className="hero-badge-item" role="listitem">
            <span className="badge-bullet">🔊</span>
            <span>Listen to answers (Text-to-Speech)</span>
          </div>
          <div className="hero-badge-item" role="listitem">
            <span className="badge-bullet">♿</span>
            <span>Accessible for visually impaired users</span>
          </div>
        </div>
      </section>

      {/* ── WHY VOXLEGAL AI? ── */}
      <section className="section-why" aria-labelledby="why-heading">
        <div className="section-header-centered">
          <h2 id="why-heading" className="section-title">
            Why VoxLegal AI?
          </h2>
          <p className="section-subtitle">
            Engineered for precision, statutory rigor, and universal accessibility.
          </p>
        </div>

        <div className="why-grid">
          {whyPoints.map((pt, idx) => (
            <div key={idx} className="why-card">
              <div className="why-icon-wrap" aria-hidden="true">
                {pt.icon}
              </div>
              <h3 className="why-title">{pt.title}</h3>
              <p className="why-desc">{pt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-how" aria-labelledby="how-heading">
        <div className="section-header-centered">
          <h2 id="how-heading" className="section-title">
            How It Works
          </h2>
          <p className="section-subtitle">
            A three-step verification pipeline from raw contract to evidence-grounded answer.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((st, idx) => (
            <div key={idx} className="step-card">
              <div className="step-number" aria-hidden="true">
                {st.num}
              </div>
              <h3 className="step-title">{st.title}</h3>
              <p className="step-desc">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACCESSIBILITY & RESPONSIBLE USE ── */}
      <section className="section-callout" aria-labelledby="access-heading">
        <div className="callout-card">
          <div className="callout-icon-col" aria-hidden="true">
            <EyeIcon size={32} />
          </div>
          <div className="callout-text-col">
            <h3 id="access-heading" className="callout-title">
              Built for Universal Accessibility
            </h3>
            <p className="callout-body">
              VoxLegal AI offers complete keyboard accessibility, screen-reader optimized markup,
              a dedicated Low Vision Mode with high contrast and text scaling, and neural speech
              synthesis with natural Indian English accents.
            </p>
            <div className="callout-footer-disclaimer">
              <strong>Responsible Use Notice:</strong> VoxLegal AI is an assistive document analysis tool
              and does not provide formal legal advice. Always consult a qualified advocate or attorney
              for binding legal representations.
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-brand-row">
            <div className="footer-brand">
              <ScalesIcon size={20} />
              <span>VoxLegal AI</span>
            </div>
            <p className="footer-copy">
              © {new Date().getFullYear()} VoxLegal AI · Evidence-Grounded Legal Document Intelligence.
            </p>
          </div>
          <div className="footer-links">
            <button className="footer-link" onClick={onUploadClick}>
              Upload Document
            </button>
            <button className="footer-link" onClick={onVoiceClick}>
              Voice Assistant
            </button>
            <button className="footer-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

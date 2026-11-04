import {
  ScalesIcon,
  FileTextIcon,
  MicIcon,
  UploadCloudIcon,
  EyeIcon,
} from "./Icons";

export default function Sidebar({
  currentView,
  setCurrentView,
  docInfo,
  onNewChat,
  uploadedDocsCount = 1,
}) {
  return (
    <aside className="app-sidebar" aria-label="Sidebar Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-badge" aria-hidden="true">
          <ScalesIcon size={20} />
        </div>
        <span className="brand-name">VoxLegal AI</span>
      </div>

      {/* Primary New Action */}
      <div className="sidebar-action-wrap">
        <button
          className="sidebar-new-btn"
          onClick={onNewChat}
          aria-label="Start New Legal Document Chat"
        >
          <span className="plus-icon" aria-hidden="true">+</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${currentView === "workspace" ? "active" : ""}`}
          onClick={() => setCurrentView(docInfo ? "workspace" : "upload")}
          aria-current={currentView === "workspace" ? "page" : undefined}
        >
          <FileTextIcon size={18} />
          <span>Active Document</span>
          {docInfo && <span className="sidebar-item-badge">1</span>}
        </button>

        <button
          className={`sidebar-nav-item ${currentView === "voice" ? "active" : ""}`}
          onClick={() => setCurrentView("voice")}
          aria-current={currentView === "voice" ? "page" : undefined}
        >
          <MicIcon size={18} />
          <span>Voice Mode</span>
        </button>

        <button
          className={`sidebar-nav-item ${currentView === "documents" ? "active" : ""}`}
          onClick={() => setCurrentView("documents")}
          aria-current={currentView === "documents" ? "page" : undefined}
        >
          <FileTextIcon size={18} />
          <span>My Documents</span>
          <span className="sidebar-item-badge">{uploadedDocsCount}</span>
        </button>

        <button
          className={`sidebar-nav-item ${currentView === "upload" ? "active" : ""}`}
          onClick={() => setCurrentView("upload")}
          aria-current={currentView === "upload" ? "page" : undefined}
        >
          <UploadCloudIcon size={18} />
          <span>Upload File</span>
        </button>

        <button
          className={`sidebar-nav-item ${currentView === "accessibility" ? "active" : ""}`}
          onClick={() => setCurrentView("accessibility")}
          aria-current={currentView === "accessibility" ? "page" : undefined}
        >
          <EyeIcon size={18} />
          <span>Accessibility</span>
        </button>
      </nav>

      {/* Bottom Profile & Plan Card */}
      <div className="sidebar-footer">
        <div className="sidebar-plan-card">
          <div className="plan-label">Free Tier Active</div>
          <div className="plan-sub">Local FAISS + AI RAG</div>
        </div>

        <div className="sidebar-user-row">
          <div className="user-avatar" aria-hidden="true">
            P
          </div>
          <div className="user-info">
            <span className="user-name">Professional</span>
            <span className="user-role">Legal Workspace</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

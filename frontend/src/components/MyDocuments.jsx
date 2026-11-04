import { FileTextIcon, UploadCloudIcon } from "./Icons";

export default function MyDocuments({
  activeDoc,
  onOpenDoc,
  onUploadNew,
  onSampleSelect,
}) {
  const sampleDocs = [
    { name: "Sample_Employment_Contract.png", title: "Employment Agreement", pages: 1, type: "PNG (Scanned OCR)" },
    { name: "Sample_Rent_Agreement.pdf", title: "Residential Lease Deed", pages: 2, type: "PDF Digital" },
    { name: "Indian_Commercial_Services_Agreement.pdf", title: "Commercial Services Contract", pages: 1, type: "PDF Commercial" },
  ];

  return (
    <div className="documents-screen-wrap">
      <div className="documents-header-row">
        <div>
          <h1 className="docs-main-title">My Documents</h1>
          <p className="docs-subtitle">Manage, review, and query your uploaded contracts and legal agreements.</p>
        </div>
        <button className="btn btn-primary" onClick={onUploadNew}>
          <UploadCloudIcon size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* ACTIVE LOADED DOCUMENT */}
      {activeDoc ? (
        <div className="active-doc-banner">
          <div className="banner-icon" aria-hidden="true">
            <FileTextIcon size={24} />
          </div>
          <div className="banner-info">
            <div className="banner-title-row">
              <span className="banner-name">{activeDoc.filename}</span>
              <span className="badge badge-mint">Active in Workspace</span>
            </div>
            <div className="banner-meta">
              <span>{activeDoc.total_pages} Pages</span> ·{" "}
              <span>{activeDoc.total_clauses} Clauses Indexed</span> ·{" "}
              <span>{activeDoc.summary?.document_type || "Legal Document"}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenDoc(activeDoc)}>
            Continue in Workspace →
          </button>
        </div>
      ) : (
        <div className="empty-docs-alert">
          <p>No document is currently active in the workspace.</p>
        </div>
      )}

      {/* REPOSITORY SECTIONS */}
      <div className="repo-section">
        <h2 className="repo-heading">Sample Pre-Indexed Legal Documents</h2>
        <p className="repo-sub">Quick-load these standard agreements to test the QA and clause retrieval engine:</p>

        <div className="repo-grid">
          {sampleDocs.map((doc, idx) => (
            <div key={idx} className="repo-card">
              <div className="repo-card-top">
                <FileTextIcon size={20} className="repo-file-icon" />
                <span className="repo-type-tag">{doc.type}</span>
              </div>
              <h3 className="repo-doc-title">{doc.title}</h3>
              <p className="repo-doc-filename">{doc.name}</p>
              <div className="repo-footer">
                <span className="repo-page-count">{doc.pages} page{doc.pages > 1 ? "s" : ""}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSampleSelect(doc.name)}
                >
                  Load Agreement
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

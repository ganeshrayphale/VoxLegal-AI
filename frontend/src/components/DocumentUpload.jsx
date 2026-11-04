import { useRef, useState } from "react";
import { UploadCloudIcon, FileTextIcon, CheckIcon } from "./Icons";

export default function DocumentUpload({
  docFile,
  setDocFile,
  onProcess,
  processing,
  processingStep,
  onSampleSelect,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const sampleDocs = [
    { name: "Employment Contract", file: "Sample_Employment_Contract.png", type: "PNG / Scanned OCR" },
    { name: "Rental Agreement", file: "Sample_Rent_Agreement.pdf", type: "PDF Digital" },
    { name: "Commercial Agreement", file: "Indian_Commercial_Services_Agreement.pdf", type: "PDF Commercial" },
  ];

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "png", "jpg", "jpeg"].includes(ext)) {
      alert("Please upload a PDF or document image (.png, .jpg, .jpeg).");
      return;
    }
    setDocFile(file);
  };

  return (
    <div className="upload-screen-container">
      <div className="upload-header-row">
        <h1 className="upload-main-title">Upload Your Legal Document</h1>
        <p className="upload-subtitle">
          Supported formats: PDF, PNG, JPG (Dual-Mode Digital Text &amp; Scanned RapidOCR Engine)
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        className={`upload-drop-card ${dragOver ? "dragover" : ""} ${docFile ? "has-file" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        aria-label="Upload document drag and drop area. Click to choose file from your device."
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="upload-icon-circle" aria-hidden="true">
          <UploadCloudIcon size={36} />
        </div>

        <div className="upload-card-instructions">
          <p className="upload-prompt-primary">
            {docFile ? `Selected: ${docFile.name}` : "Drag & drop your file here"}
          </p>
          <p className="upload-prompt-secondary">
            {docFile
              ? `Ready to index (${(docFile.size / 1024).toFixed(1)} KB) · Click to change`
              : "or click to browse from your computer"}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-choose-file"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <span>Choose File</span>
        </button>
      </div>

      {/* Action Button: Process Document */}
      {docFile && (
        <div className="process-action-bar">
          <button
            className="btn btn-primary btn-process-start"
            onClick={onProcess}
            disabled={processing}
            aria-live="polite"
          >
            {processing ? (
              <>
                <div className="spinner" />
                <span>{processingStep || "Extracting clauses & building FAISS index..."}</span>
              </>
            ) : (
              <>
                <CheckIcon size={18} />
                <span>Process &amp; Analyze Document</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Sample Document Section (From Mockup) */}
      <div className="sample-docs-section">
        <span className="sample-docs-title">Try a sample document:</span>
        <div className="sample-buttons-row">
          {sampleDocs.map((s, idx) => (
            <button
              key={idx}
              className="btn btn-secondary sample-doc-card-btn"
              onClick={() => onSampleSelect(s.file)}
              disabled={processing}
              title={`Load sample: ${s.name}`}
            >
              <FileTextIcon size={16} />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";
import { AccessibilityProvider, useAccessibility } from "./context/AccessibilityContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LandingPage from "./components/LandingPage";
import DocumentUpload from "./components/DocumentUpload";
import DocumentWorkspace from "./components/DocumentWorkspace";
import VoiceMode from "./components/VoiceMode";
import AccessibilityPanel from "./components/AccessibilityPanel";
import MyDocuments from "./components/MyDocuments";

const API =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

/* ── Toast Helper ── */
function useToast() {
  const [toast, setToast] = useState({ msg: "", type: "info", show: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = "info") => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, show: true });
    timerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      3500,
    );
  }, []);

  return { toast, showToast };
}

function MainApp() {
  // Navigation views: 'landing' | 'workspace' | 'upload' | 'voice' | 'documents' | 'accessibility'
  const [currentView, setCurrentView] = useState("landing");

  // Document state
  const [docFile, setDocFile] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("");

  // Speech & Audio state
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoSpeak] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("en-IN-NeerjaNeural");

  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const { toast, showToast } = useToast();
  const { voiceAssistance } = useAccessibility();

  /* ── Stop Speech Playback ── */
  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  /* ── Neural Speech Synthesis (Edge TTS with Fallback) ── */
  const speakText = useCallback(
    async (text) => {
      if (!text || !voiceAssistance) return;

      stopSpeaking();
      setSpeaking(true);

      try {
        const res = await fetch(`${API}/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            voice: selectedVoice,
          }),
        });

        if (!res.ok) {
          throw new Error("Neural TTS service unavailable");
        }

        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } catch (err) {
        console.warn("Backend neural TTS error, falling back to Web Speech synthesis:", err);
        if (window.speechSynthesis) {
          const cleanText = text
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/\(Note:.*?\)\.?/gs, "")
            .trim();

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = selectedVoice.startsWith("en-IN") ? "en-IN" : "en-US";
          utterance.rate = 1.0;
          utterance.onstart = () => setSpeaking(true);
          utterance.onend = () => setSpeaking(false);
          utterance.onerror = () => setSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeaking(false);
        }
      }
    },
    [selectedVoice, stopSpeaking, voiceAssistance],
  );

  /* ── Speech Recognition (Web Speech API) ── */
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recog = new SpeechRec();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setInputQuestion(transcript);
    };

    recog.onend = () => {
      setListening(false);
    };

    recog.onerror = (e) => {
      setListening(false);
      showToast(`Mic notice: ${e.error}`, "info");
    };

    recognitionRef.current = recog;
    return () => recog.abort();
  }, [showToast]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      showToast("Speech recognition is not supported in this browser. Please use Chrome or Edge.", "error");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      setInputQuestion("");
      try {
        recognitionRef.current.start();
        setListening(true);
        showToast("Listening... Speak your legal question now.", "info");
      } catch {
        setListening(false);
      }
    }
  }, [listening, stopSpeaking, showToast]);

  /* ── Global Accessibility Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleListening();
      } else if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        stopSpeaking();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleListening, stopSpeaking]);

  /* ── Process Document Pipeline ── */
  const processDocument = async (overrideFile = null) => {
    const fileToProcess = overrideFile || docFile;
    if (!fileToProcess) {
      showToast("Please choose or drag a document first.", "error");
      return;
    }

    setProcessing(true);
    setDocInfo(null);
    setChatHistory([]);
    setProcessingStep("Uploading file to ingestion server...");

    try {
      const fd = new FormData();
      fd.append("file", fileToProcess);

      setProcessingStep("Extracting text & running RapidOCR...");
      const res = await fetch(`${API}/process-document`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Document processing failed");
      }

      const data = await res.json();
      setDocInfo(data);
      setCurrentView("workspace");
      showToast(`Indexed ${data.total_clauses} legal clauses into FAISS vector store.`, "success");

      // Initial greeting in chat
      if (data.summary) {
        const greeting = `I have analyzed **${data.filename}**. It is identified as a **${data.summary.document_type || "Legal Document"}** with ${data.total_clauses} indexed clauses. You can ask any question about conditions, termination rules, or obligations by text or voice!`;
        setChatHistory([
          {
            sender: "assistant",
            text: greeting,
            is_grounded: true,
            evidence: [],
          },
        ]);
        setLastAnswer(greeting);
        if (autoSpeak) {
          speakText(greeting);
        }
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  };

  /* ── 1-Click Sample Document Selector ── */
  const handleSampleSelect = async (filename) => {
    showToast(`Loading sample: ${filename}...`, "info");
    setProcessing(true);
    setProcessingStep(`Fetching sample ${filename}...`);

    try {
      const response = await fetch(`/samples/${filename}`);
      if (!response.ok) throw new Error("Could not load sample file from server");
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      setDocFile(file);
      await processDocument(file);
    } catch (err) {
      showToast(`Error loading sample: ${err.message}`, "error");
      setProcessing(false);
      setProcessingStep("");
    }
  };

  /* ── Ask Question (RAG Pipeline) ── */
  const askQuestion = async (customQuery = null) => {
    const q = (customQuery || inputQuestion).trim();
    if (!q) {
      showToast("Please enter or speak a question.", "error");
      return;
    }
    if (!docInfo) {
      showToast("Please upload a document first.", "error");
      setCurrentView("upload");
      return;
    }

    // Append user question
    setChatHistory((prev) => [...prev, { sender: "user", text: q }]);
    setInputQuestion("");
    setAsking(true);
    stopSpeaking();

    try {
      const res = await fetch(`${API}/ask-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, top_k: 5 }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Query failed");
      }

      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: data.answer,
          is_grounded: data.is_grounded,
          evidence: data.evidence || [],
        },
      ]);
      setLastAnswer(data.answer);

      if (autoSpeak && data.answer) {
        speakText(data.answer);
      }
    } catch (e) {
      showToast(e.message, "error");
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `An error occurred: ${e.message}`,
          is_grounded: false,
          evidence: [],
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setInputQuestion("");
    setLastAnswer("");
    setCurrentView("upload");
  };

  const showSidebar = ["workspace", "upload", "voice", "documents", "accessibility"].includes(
    currentView,
  );

  return (
    <div className="app-shell">
      {/* Skip to Main Content Link for Screen Readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        speaking={speaking}
        stopSpeaking={stopSpeaking}
      />

      <div className="app-main-layout">
        {/* Left Sidebar (Only in app view modes) */}
        {showSidebar && (
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            docInfo={docInfo}
            onNewChat={handleNewChat}
          />
        )}

        {/* Content Area */}
        <div id="main-content" className="app-content-area" role="main">
          {/* VIEW 1: LANDING PAGE */}
          {currentView === "landing" && (
            <LandingPage
              onUploadClick={() => setCurrentView("upload")}
              onVoiceClick={() => setCurrentView("voice")}
              onSampleClick={handleSampleSelect}
            />
          )}

          {/* VIEW 2: DOCUMENT UPLOAD */}
          {currentView === "upload" && (
            <DocumentUpload
              docFile={docFile}
              setDocFile={setDocFile}
              onProcess={() => processDocument()}
              processing={processing}
              processingStep={processingStep}
              onSampleSelect={handleSampleSelect}
            />
          )}

          {/* VIEW 3: THREE-PANEL DOCUMENT WORKSPACE */}
          {currentView === "workspace" && (
            docInfo ? (
              <DocumentWorkspace
                docInfo={docInfo}
                chatHistory={chatHistory}
                onAskQuestion={askQuestion}
                asking={asking}
                inputQuestion={inputQuestion}
                setInputQuestion={setInputQuestion}
                listening={listening}
                onToggleListening={toggleListening}
                onSpeakText={speakText}
                onSummarizeClick={() => askQuestion("Summarize the main provisions and key terms of this document.")}
              />
            ) : (
              <DocumentUpload
                docFile={docFile}
                setDocFile={setDocFile}
                onProcess={() => processDocument()}
                processing={processing}
                processingStep={processingStep}
                onSampleSelect={handleSampleSelect}
              />
            )
          )}

          {/* VIEW 4: DEDICATED VOICE MODE */}
          {currentView === "voice" && (
            <VoiceMode
              docInfo={docInfo}
              listening={listening}
              onToggleListening={toggleListening}
              speaking={speaking}
              onStopSpeaking={stopSpeaking}
              onSpeakText={speakText}
              lastAnswer={lastAnswer}
              inputQuestion={inputQuestion}
              setInputQuestion={setInputQuestion}
              onAskQuestion={askQuestion}
              asking={asking}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
            />
          )}

          {/* VIEW 5: ACCESSIBILITY SETTINGS */}
          {currentView === "accessibility" && <AccessibilityPanel />}

          {/* VIEW 6: MY DOCUMENTS */}
          {currentView === "documents" && (
            <MyDocuments
              activeDoc={docInfo}
              onOpenDoc={() => setCurrentView("workspace")}
              onUploadNew={() => setCurrentView("upload")}
              onSampleSelect={handleSampleSelect}
            />
          )}
        </div>
      </div>

      {/* Accessible Toast Notification */}
      {toast.show && (
        <div
          className={`toast-notice ${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <MainApp />
    </AccessibilityProvider>
  );
}

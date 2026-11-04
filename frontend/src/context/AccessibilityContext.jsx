import { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [lowVision, setLowVision] = useState(() => {
    return localStorage.getItem("voxlegal_low_vision") === "true";
  });

  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem("voxlegal_text_size") || "normal";
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("voxlegal_high_contrast") === "true";
  });

  const [voiceAssistance, setVoiceAssistance] = useState(() => {
    const saved = localStorage.getItem("voxlegal_voice_assist");
    return saved !== null ? saved === "true" : true;
  });

  const [keyboardNav, setKeyboardNav] = useState(() => {
    return localStorage.getItem("voxlegal_keyboard_nav") === "true";
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem("voxlegal_reduced_motion") === "true";
  });

  // Apply to document body
  useEffect(() => {
    localStorage.setItem("voxlegal_low_vision", lowVision);
    if (lowVision) {
      document.documentElement.classList.add("low-vision");
    } else {
      document.documentElement.classList.remove("low-vision");
    }
  }, [lowVision]);

  useEffect(() => {
    localStorage.setItem("voxlegal_text_size", textSize);
    document.documentElement.setAttribute("data-text-size", textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem("voxlegal_high_contrast", highContrast);
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem("voxlegal_voice_assist", voiceAssistance);
  }, [voiceAssistance]);

  useEffect(() => {
    localStorage.setItem("voxlegal_keyboard_nav", keyboardNav);
    if (keyboardNav) {
      document.documentElement.classList.add("keyboard-mode");
    } else {
      document.documentElement.classList.remove("keyboard-mode");
    }
  }, [keyboardNav]);

  useEffect(() => {
    localStorage.setItem("voxlegal_reduced_motion", reducedMotion);
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  }, [reducedMotion]);

  return (
    <AccessibilityContext.Provider
      value={{
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
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}

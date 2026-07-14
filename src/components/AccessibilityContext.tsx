import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trackEvent } from "../analytics";

export interface AccessibilityContextType {
  textSize: "normal" | "large" | "extra-large";
  highContrast: boolean;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Initialize from localStorage if present
  useEffect(() => {
    const savedSize = localStorage.getItem("mc_accessibility_text_size");
    if (savedSize === "large" || savedSize === "extra-large" || savedSize === "normal") {
      setTextSize(savedSize);
    }
    const savedContrast = localStorage.getItem("mc_accessibility_high_contrast");
    if (savedContrast === "true") {
      setHighContrast(true);
    }
  }, []);

  const increaseTextSize = () => {
    setTextSize((prev) => {
      const next = prev === "normal" ? "large" : "extra-large";
      localStorage.setItem("mc_accessibility_text_size", next);
      trackEvent("accessibility_changed", { type: "text_size", value: next });
      return next;
    });
  };

  const decreaseTextSize = () => {
    setTextSize((prev) => {
      const next = prev === "extra-large" ? "large" : "normal";
      localStorage.setItem("mc_accessibility_text_size", next);
      trackEvent("accessibility_changed", { type: "text_size", value: next });
      return next;
    });
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem("mc_accessibility_high_contrast", String(next));
      trackEvent("accessibility_changed", { type: "high_contrast", value: next });
      return next;
    });
  };

  // Build the outer classes to apply to the root wrapper
  const accessibilityClasses = [
    textSize === "large" ? "text-lg md:text-xl" : textSize === "extra-large" ? "text-xl md:text-2xl" : "",
    highContrast ? "high-contrast-mode" : "",
  ].join(" ").trim();

  // Inject styles dynamically if highContrast is enabled
  useEffect(() => {
    const styleId = "accessibility-custom-styles";
    let styleEl = document.getElementById(styleId);

    if (highContrast) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        .high-contrast-mode {
          background-color: #000000 !important;
          color: #FFFFFF !important;
        }
        .high-contrast-mode .bg-brand-bg {
          background-color: #000000 !important;
        }
        .high-contrast-mode .bg-brand-dark {
          background-color: #000000 !important;
          border-color: #FFFFFF !important;
        }
        .high-contrast-mode .text-brand-dark, 
        .high-contrast-mode .text-gray-900,
        .high-contrast-mode .text-gray-800 {
          color: #FFFFFF !important;
        }
        .high-contrast-mode .text-gray-600,
        .high-contrast-mode .text-gray-500 {
          color: #E2E8F0 !important;
        }
        .high-contrast-mode button, 
        .high-contrast-mode a {
          outline: 2px solid #FFFFFF !important;
          color: #FFFFFF !important;
        }
        .high-contrast-mode .border-gray-200,
        .high-contrast-mode .border-gray-300 {
          border-color: #FFFFFF !important;
        }
      `;
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }
  }, [highContrast]);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        highContrast,
        increaseTextSize,
        decreaseTextSize,
        toggleHighContrast,
      }}
    >
      <div className={accessibilityClasses}>{children}</div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

import { useEffect, useState } from "react";

const STORAGE_KEY = "htma_practitioner_mode";

/**
 * Practitioner Validation Mode Hook
 *
 * Hidden dev-only mode for practitioners to validate results.
 * - Enable: ?practitioner=1 in URL
 * - Disable: ?practitioner=0 in URL
 * - Only works in development or if NEXT_PUBLIC_ENABLE_PRACTITIONER_MODE=true
 */
export function usePractitionerMode() {
  const [isPractitionerMode, setIsPractitionerMode] = useState(false);

  useEffect(() => {
    // Check if practitioner mode is allowed in this environment
    const isDevelopment = process.env.NODE_ENV === "development";
    const isExplicitlyEnabled =
      process.env.NEXT_PUBLIC_ENABLE_PRACTITIONER_MODE === "true";
    const canEnablePractitionerMode = isDevelopment || isExplicitlyEnabled;

    // Check URL params first
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const practitionerParam = params.get("practitioner");

      if (practitionerParam === "1" && canEnablePractitionerMode) {
        // Enable practitioner mode
        localStorage.setItem(STORAGE_KEY, "true");
        setIsPractitionerMode(true);

        // Clean URL (remove param without page reload)
        const url = new URL(window.location.href);
        url.searchParams.delete("practitioner");
        window.history.replaceState({}, "", url.toString());
      } else if (practitionerParam === "0") {
        // Disable practitioner mode
        localStorage.removeItem(STORAGE_KEY);
        setIsPractitionerMode(false);

        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete("practitioner");
        window.history.replaceState({}, "", url.toString());
      } else {
        // Check localStorage for existing state
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "true" && canEnablePractitionerMode) {
          setIsPractitionerMode(true);
        } else {
          // If mode is not allowed in production, clear it
          if (!canEnablePractitionerMode) {
            localStorage.removeItem(STORAGE_KEY);
          }
          setIsPractitionerMode(false);
        }
      }
    }
  }, []);

  const disablePractitionerMode = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setIsPractitionerMode(false);
    }
  };

  return {
    isPractitionerMode,
    disablePractitionerMode,
  };
}

import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSpeech({ onResult, onInterim, enabled = false, lang = "en-IN" }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const shouldRestartRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setError("Web Speech API not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (shouldRestartRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone permissions.");
        shouldRestartRef.current = false;
      } else if (event.error === "network") {
        setError("Network error during speech recognition.");
      } else if (event.error === "no-speech") {
        // ignore — auto-restart handles this
      }
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim && onInterim) onInterim(interim);
      if (final && onResult) onResult(final.trim());
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      try { recognition.stop(); } catch (e) {}
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    shouldRestartRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (e) {}
  }, [supported]);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
  }, []);

  return { isListening, error, supported, start, stop };
}

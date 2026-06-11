import { useRef, useState, useCallback } from "react";

export function useMediaRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = useCallback(async (stream) => {
    chunksRef.current = [];
    
    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm;codecs=vp8,opus";
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/webm";
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) { resolve(null); return; }
      clearInterval(timerRef.current);
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current.mimeType || "video/webm",
        });
        setIsRecording(false);
        resolve(blob);
      };
      
      try { mediaRecorderRef.current.stop(); }
      catch (e) { resolve(null); }
    });
  }, []);

  return { isRecording, recordingTime, startRecording, stopRecording };
}

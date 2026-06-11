import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Flame } from "lucide-react";
import { VideoGrid } from "../components/Meeting/VideoGrid";
import { LiveTranscript } from "../components/Meeting/LiveTranscript";
import { MeetingControls } from "../components/Meeting/MeetingControls";
import { useWebSpeech } from "../hooks/useWebSpeech";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { useAuth } from "../context/AuthContext";
import { meetingService } from "../services/meetingService";
import { formatDuration } from "../utils/formatTime";
import { STUN_SERVERS } from "../utils/constants";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Participant info (from session or user profile)
  const participantInfo = (() => {
    const stored = sessionStorage.getItem(`vs_participant_${meetingId}`);
    if (stored) return JSON.parse(stored);
    if (user) return { name: user.name, role: user.role, is_guest: false };
    return { name: "Guest", role: "vendor", is_guest: true };
  })();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [endingMeeting, setEndingMeeting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [remoteStreams, setRemoteStreams] = useState({});

  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const startTimeRef = useRef(Date.now());
  const durationTimerRef = useRef(null);

  const { isRecording, recordingTime, startRecording, stopRecording } = useMediaRecorder();

  // WebSpeech
  const { isListening, error: speechError, supported: speechSupported, start: startSpeech, stop: stopSpeech } = useWebSpeech({
    onResult: (text) => {
      if (!text.trim()) return;
      const seg = {
        id: Date.now().toString(),
        speaker_name: participantInfo.name,
        speaker_role: participantInfo.role,
        text,
        start_time: (Date.now() - startTimeRef.current) / 1000,
        end_time: (Date.now() - startTimeRef.current) / 1000 + 2,
        timestamp: new Date().toISOString(),
        is_final: true,
      };
      setSegments((prev) => [...prev, seg]);
      setInterimText("");
      socketRef.current?.emit("transcript_chunk", {
        meeting_id: meetingId,
        speaker_name: participantInfo.name,
        speaker_role: participantInfo.role,
        text,
        start_time: seg.start_time,
        is_final: true,
      });
    },
    onInterim: (text) => setInterimText(text),
    lang: "en-IN",
  });

  // Setup
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Load meeting
        const res = await meetingService.get(meetingId);
        if (mounted) setMeeting(res.data);

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = stream;

        // Socket.io
        const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join_meeting", {
            meeting_id: meetingId,
            name: participantInfo.name,
            role: participantInfo.role,
          });
        });

        // Someone else joined — initiate WebRTC call to them
        socket.on("participant-joined", ({ sid, name, role }) => {
          toast(`${name} joined as ${role}`, { icon: "👤" });
          setRemoteStreams((prev) => ({ ...prev, [sid]: { name, role, stream: null } }));
          initiateCall(sid, stream, socket);
        });

        socket.on("current-participants", (participants) => {
          participants.forEach(({ sid, name, role }) => {
            setRemoteStreams((prev) => ({ ...prev, [sid]: { name, role, stream: null } }));
            initiateCall(sid, stream, socket);
          });
        });

        socket.on("participant-left", ({ sid, name }) => {
          toast(`${name} left the meeting`);
          closePeer(sid);
        });

        socket.on("transcript-broadcast", (seg) => {
          if (seg.speaker_name !== participantInfo.name) {
            setSegments((prev) => [...prev, { ...seg, id: seg.id || Date.now().toString() }]);
          }
        });

        socket.on("webrtc-offer", ({ from, offer }) => handleOffer(from, offer, stream, socket));
        socket.on("webrtc-answer", ({ from, answer }) => handleAnswer(from, answer));
        socket.on("webrtc-ice-candidate", ({ from, candidate }) => handleIceCandidate(from, candidate));

        socket.on("meeting-ended", () => {
          toast("Meeting has ended.");
          navigate(`/report/${meetingId}`);
        });

        // Load existing transcript
        try {
          const tRes = await meetingService.getTranscript(meetingId);
          if (mounted && tRes.data.segments?.length > 0) {
            setSegments(tRes.data.segments.map((s) => ({
              ...s,
              id: s.id || Math.random().toString(),
            })));
          }
        } catch (_) {}

        if (mounted) setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to join meeting. Check camera/microphone permissions.");
        if (mounted) setLoading(false);
      }
    };

    init();

    // Duration timer
    durationTimerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      mounted = false;
      stopSpeech();
      clearInterval(durationTimerRef.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((pc) => pc.close());
      socketRef.current?.disconnect();
    };
  }, [meetingId]);

  // Automatically start speech recognition when ready
  useEffect(() => {
    if (!loading && speechSupported && micEnabled) {
      startSpeech();
    }
    if (speechError) toast.error(speechError);
  }, [loading, speechSupported, speechError]);

  const createPeerConnection = (targetSid, stream, socket) => {
    if (peersRef.current[targetSid]) return peersRef.current[targetSid];
    const pc = new RTCPeerConnection(STUN_SERVERS);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setRemoteStreams((prev) => ({
        ...prev,
        [targetSid]: { ...(prev[targetSid] || {}), stream: remoteStream },
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", { target: targetSid, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        closePeer(targetSid);
      }
    };

    peersRef.current[targetSid] = pc;
    return pc;
  };

  const initiateCall = async (targetSid, stream, socket) => {
    const pc = createPeerConnection(targetSid, stream, socket);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc_offer", { target: targetSid, offer });
  };

  const handleOffer = async (fromSid, offer, stream, socket) => {
    const pc = createPeerConnection(fromSid, stream, socket);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("webrtc_answer", { target: fromSid, answer });
  };

  const handleAnswer = async (fromSid, answer) => {
    const pc = peersRef.current[fromSid];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async (fromSid, candidate) => {
    const pc = peersRef.current[fromSid];
    if (pc) try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (_) {}
  };

  const closePeer = (sid) => {
    peersRef.current[sid]?.close();
    delete peersRef.current[sid];
    setRemoteStreams((prev) => {
      const u = { ...prev };
      delete u[sid];
      return u;
    });
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
      if (audioTrack.enabled) startSpeech();
      else stopSpeech();
    }
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob && blob.size > 0) {
        const formData = new FormData();
        formData.append("file", blob, `recording-${meetingId}.webm`);
        try {
          await meetingService.uploadRecording(meetingId, formData);
          toast.success("Recording saved!");
        } catch (e) {
          toast.error("Failed to upload recording");
        }
      }
    } else {
      const stream = localStreamRef.current;
      if (stream) {
        await startRecording(stream);
        toast.success("Recording started");
      }
    }
  };

  const isHost = !participantInfo.is_guest &&
    (user?.id === meeting?.created_by || meeting?.host_name === participantInfo.name);

  const handleEndMeeting = async () => {
    if (!window.confirm("End the meeting for everyone? AI analysis will begin.")) return;
    setEndingMeeting(true);

    // Stop recording if active
    if (isRecording) {
      const blob = await stopRecording();
      if (blob && blob.size > 0) {
        const formData = new FormData();
        formData.append("file", blob, `recording-${meetingId}.webm`);
        try { await meetingService.uploadRecording(meetingId, formData); } catch (_) {}
      }
    }

    try {
      await meetingService.end(meetingId);
      socketRef.current?.emit("meeting_ended", { meeting_id: meetingId });
      toast.success("Meeting ended. Generating AI report...");
      navigate(`/report/${meetingId}`);
    } catch (e) {
      toast.error("Failed to end meeting");
      setEndingMeeting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <Flame size={22} className="text-fire-core animate-pulse-fire" />
            <span className="font-display text-2xl">Setting up meeting...</span>
          </div>
          <p className="text-text-dim text-sm">Connecting camera and microphone</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-void flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-bg-dark border-b border-bg-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Flame size={18} className="text-fire-core" />
          <span className="font-display text-xl text-text-primary">
            {meeting?.title || "Meeting"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-fire-core text-lg">
            {formatDuration(duration)}
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 text-xs text-fire-core font-semibold">
              <span className="w-2 h-2 rounded-full bg-fire-core animate-rec-dot" />
              REC {formatDuration(recordingTime)}
            </div>
          )}
          {!speechSupported && (
            <span className="text-xs text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded">
              Speech API not supported
            </span>
          )}
        </div>

        <div className="text-sm text-text-secondary">
          {participantInfo.name} · {participantInfo.role}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Grid — 60% */}
        <div className="w-3/5 border-r border-bg-border overflow-hidden">
          <VideoGrid
            localStream={localStreamRef.current}
            remoteStreams={remoteStreams}
            localUser={participantInfo}
          />
        </div>

        {/* Transcript — 40% */}
        <div className="w-2/5 flex flex-col bg-bg-dark overflow-hidden">
          <LiveTranscript
            segments={segments}
            interimText={interimText}
            isLive={isListening}
          />
        </div>
      </div>

      {/* Controls */}
      <MeetingControls
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        isRecording={isRecording}
        recordingTime={recordingTime}
        isHost={isHost}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleRecording={toggleRecording}
        onEndMeeting={handleEndMeeting}
        onLeaveMeeting={() => {
          if (window.confirm("Leave the meeting?")) {
            navigate(isAuthenticated ? "/dashboard" : "/");
          }
        }}
        endingMeeting={endingMeeting}
      />
    </div>
  );
}

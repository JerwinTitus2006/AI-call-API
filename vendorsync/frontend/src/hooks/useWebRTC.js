import { useRef, useState, useCallback } from "react";
import { STUN_SERVERS } from "../utils/constants";

export function useWebRTC({ socket, localStream, onRemoteStream, onParticipantLeft }) {
  const peersRef = useRef({}); // sid -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState({}); // sid -> {stream, name, role}

  const createPeer = useCallback(
    (targetSid) => {
      const pc = new RTCPeerConnection(STUN_SERVERS);

      if (localStream) {
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      }

      pc.ontrack = (event) => {
        const stream = event.streams[0];
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSid]: { ...(prev[targetSid] || {}), stream },
        }));
        if (onRemoteStream) onRemoteStream(targetSid, stream);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc_ice_candidate", {
            target: targetSid,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setRemoteStreams((prev) => {
            const updated = { ...prev };
            delete updated[targetSid];
            return updated;
          });
          if (onParticipantLeft) onParticipantLeft(targetSid);
        }
      };

      peersRef.current[targetSid] = pc;
      return pc;
    },
    [localStream, socket, onRemoteStream, onParticipantLeft]
  );

  const initiateCall = useCallback(
    async (targetSid) => {
      const pc = createPeer(targetSid);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit("webrtc_offer", { target: targetSid, offer });
    },
    [createPeer, socket]
  );

  const handleOffer = useCallback(
    async (fromSid, offer) => {
      const pc = createPeer(fromSid);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket?.emit("webrtc_answer", { target: fromSid, answer });
    },
    [createPeer, socket]
  );

  const handleAnswer = useCallback(async (fromSid, answer) => {
    const pc = peersRef.current[fromSid];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const handleIceCandidate = useCallback(async (fromSid, candidate) => {
    const pc = peersRef.current[fromSid];
    if (pc) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) {}
    }
  }, []);

  const setParticipantInfo = useCallback((sid, info) => {
    setRemoteStreams((prev) => ({
      ...prev,
      [sid]: { ...(prev[sid] || {}), ...info },
    }));
  }, []);

  const closePeer = useCallback((sid) => {
    peersRef.current[sid]?.close();
    delete peersRef.current[sid];
    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[sid];
      return updated;
    });
  }, []);

  const closeAll = useCallback(() => {
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    setRemoteStreams({});
  }, []);

  return {
    remoteStreams,
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setParticipantInfo,
    closePeer,
    closeAll,
  };
}

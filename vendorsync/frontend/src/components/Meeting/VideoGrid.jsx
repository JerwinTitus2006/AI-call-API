import React, { useEffect, useRef } from "react";
import { MicOff, VideoOff } from "lucide-react";

function VideoTile({ stream, name, role, isLocal = false, muted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-tile">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-bg-dark">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              background: "rgba(255,34,0,0.15)",
              border: "2px solid rgba(255,34,0,0.4)",
              color: "#FF2200",
            }}
          >
            {name ? name.slice(0, 2).toUpperCase() : "??"}
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {isLocal ? "You" : name}
          </span>
          <span
            className={`text-xs font-bold uppercase ${
              role === "distributor" ? "text-fire-core" : "text-fire-mid"
            }`}
          >
            {role}
          </span>
        </div>
      </div>

      {isLocal && (
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-bg-dark/80 text-text-secondary px-2 py-0.5 rounded">
            YOU
          </span>
        </div>
      )}
    </div>
  );
}

export function VideoGrid({ localStream, remoteStreams, localUser }) {
  const remoteEntries = Object.entries(remoteStreams);

  return (
    <div className="h-full p-4">
      <div
        className={`grid gap-3 h-full ${
          remoteEntries.length === 0
            ? "grid-cols-1"
            : remoteEntries.length === 1
            ? "grid-cols-2"
            : "grid-cols-2"
        }`}
      >
        <VideoTile
          stream={localStream}
          name={localUser?.name || "You"}
          role={localUser?.role || "distributor"}
          isLocal
        />
        {remoteEntries.map(([sid, info]) => (
          <VideoTile
            key={sid}
            stream={info.stream}
            name={info.name || "Participant"}
            role={info.role || "vendor"}
          />
        ))}
      </div>
    </div>
  );
}

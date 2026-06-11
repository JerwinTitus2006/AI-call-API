import React from "react";
import {
  Mic, MicOff, Video, VideoOff,
  Circle, Square, PhoneOff
} from "lucide-react";
import { formatDuration } from "../../utils/formatTime";

export function MeetingControls({
  micEnabled,
  cameraEnabled,
  isRecording,
  recordingTime,
  isHost,
  onToggleMic,
  onToggleCamera,
  onToggleRecording,
  onEndMeeting,
  onLeaveMeeting,
  endingMeeting,
}) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-4 bg-bg-dark border-t border-bg-border">
      {/* Mic */}
      <button
        onClick={onToggleMic}
        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
          micEnabled
            ? "bg-bg-surface text-text-primary hover:bg-bg-border"
            : "bg-fire-core/20 text-fire-core border border-fire-core/30"
        }`}
        title={micEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        <span className="text-xs">{micEnabled ? "Mute" : "Unmuted"}</span>
      </button>

      {/* Camera */}
      <button
        onClick={onToggleCamera}
        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
          cameraEnabled
            ? "bg-bg-surface text-text-primary hover:bg-bg-border"
            : "bg-fire-core/20 text-fire-core border border-fire-core/30"
        }`}
        title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        <span className="text-xs">{cameraEnabled ? "Camera" : "Off"}</span>
      </button>

      {/* Recording */}
      <button
        onClick={onToggleRecording}
        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
          isRecording
            ? "bg-fire-core text-white glow-fire"
            : "bg-bg-surface text-text-primary hover:bg-bg-border"
        }`}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          <>
            <Square size={20} />
            <span className="text-xs font-mono">{formatDuration(recordingTime)}</span>
          </>
        ) : (
          <>
            <Circle size={20} />
            <span className="text-xs">Record</span>
          </>
        )}
      </button>

      {/* End meeting or Leave meeting */}
      {isHost ? (
        <button
          onClick={onEndMeeting}
          disabled={endingMeeting}
          className="flex flex-col items-center gap-1 p-3 rounded-xl bg-fire-core text-white hover:bg-ember transition-all glow-fire disabled:opacity-50"
          title="End meeting for everyone"
        >
          <PhoneOff size={20} />
          <span className="text-xs">{endingMeeting ? "Ending..." : "End"}</span>
        </button>
      ) : (
        <button
          onClick={onLeaveMeeting}
          className="flex flex-col items-center gap-1 p-3 rounded-xl bg-bg-surface text-text-primary hover:bg-bg-border border border-bg-border transition-all"
          title="Leave meeting"
        >
          <PhoneOff size={20} className="text-red-500" />
          <span className="text-xs">Leave</span>
        </button>
      )}
    </div>
  );
}

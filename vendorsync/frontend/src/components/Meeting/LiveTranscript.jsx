import React, { useEffect, useRef, useState } from "react";
import { formatTimestamp } from "../../utils/formatTime";

export function LiveTranscript({ segments, interimText = "", isLive = true }) {
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [segments, interimText, autoScroll]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setAutoScroll(atBottom);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border flex-shrink-0">
        <span className="font-display text-lg tracking-wider text-text-primary">LIVE TRANSCRIPT</span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs text-fire-core font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-fire-core animate-rec-dot" />
            LIVE
          </span>
        )}
      </div>

      {/* Segments */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        onScroll={handleScroll}
      >
        {segments.length === 0 && !interimText && (
          <div className="text-center text-text-dim text-sm mt-8">
            <p>Transcript will appear here when participants speak...</p>
          </div>
        )}

        {segments.map((seg) => (
          <div
            key={seg.id}
            className={`rounded p-3 animate-fade-in ${
              seg.speaker_role === "distributor" ? "segment-distributor" : "segment-vendor"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-text-dim">
                [{formatTimestamp(seg.start_time || 0)}]
              </span>
              <span className="font-mono text-xs font-bold text-text-secondary">
                {seg.speaker_name?.toUpperCase()}
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  seg.speaker_role === "distributor" ? "text-fire-core" : "text-fire-mid"
                }`}
              >
                • {seg.speaker_role}
              </span>
            </div>
            <p className="font-mono text-sm text-text-primary leading-relaxed">
              "{seg.text}"
            </p>
          </div>
        ))}

        {/* Interim text */}
        {interimText && (
          <div className="rounded p-3 border-l-2 border-text-dim bg-bg-surface">
            <p className="font-mono text-sm text-text-dim italic">"{interimText}..."</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-xs text-fire-core text-center py-2 border-t border-bg-border hover:text-fire-mid transition-colors"
        >
          ↓ Jump to latest
        </button>
      )}
    </div>
  );
}

export const ROLES = {
  DISTRIBUTOR: "distributor",
  VENDOR: "vendor",
  ADMIN: "admin",
};

export const MEETING_STATUS = {
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const SEVERITY_COLORS = {
  critical: "severity-critical",
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
};

export const SENTIMENT_COLORS = {
  positive: "text-success",
  neutral: "text-text-secondary",
  negative: "text-fire-core",
  mixed: "text-warning",
};

export const PRIORITY_COLORS = {
  high: "text-fire-core",
  medium: "text-warning",
  low: "text-text-secondary",
};

export const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

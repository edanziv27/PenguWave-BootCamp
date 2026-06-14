export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: Severity;
  title: string;
  description: string;
  assetHostname: string;
  assetIp: string;
  // Real-world data is messy: source IP and owning user can be missing.
  sourceIp: string | null;
  tags: string[];
  userId: string | null;
}

// User as shown in the UI. Passwords are never part of displayed user data —
// they are only collected on creation and sent to the backend, never rendered.
export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
}

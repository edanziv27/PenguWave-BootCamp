// Frontend-only DEMO identity.
//
// This track has no backend or real auth, so this is purely presentation state
// to show "who is signed in" in the UI. It is NOT a security claim and must
// never be used to gate access or make authorization decisions.

export interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

const DEMO_USER: CurrentUser = {
  name: "Demo Analyst",
  email: "analyst@penguwave.io",
  role: "analyst",
};

export function getCurrentUser(): CurrentUser {
  return DEMO_USER;
}

/** Derive a human-friendly display name from an email local-part. */
export function nameFromEmail(email: string): string {
  const local = (email.split("@")[0] || "").trim();
  if (!local) return email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

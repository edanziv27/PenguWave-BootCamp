const KNOWN_ROLES = ["admin", "analyst", "viewer"];

/** Role pill (ADMIN / ANALYST / VIEWER). Unknown roles get a neutral style. */
export default function RoleBadge({ role }: { role: string }) {
  const normalized = (role || "").toLowerCase();
  const variant = KNOWN_ROLES.includes(normalized) ? normalized : "unknown";
  return <span className={`role-badge role-${variant}`}>{(role || "—").toUpperCase()}</span>;
}

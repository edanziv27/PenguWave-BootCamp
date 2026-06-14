import { getCurrentUser } from "../currentUser";

/**
 * Top-right indicator of the signed-in user. Demo-only presentation state
 * (see currentUser.ts) — clicking it opens the login modal.
 */
export default function CurrentUserBadge({ onClick }: { onClick: () => void }) {
  const user = getCurrentUser();
  const initials = user.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      className="current-user"
      onClick={onClick}
      title="Sign in"
      aria-label={`Signed in as ${user.name} (demo). Open sign in.`}
    >
      <span className="current-user-avatar" aria-hidden="true">
        {initials}
      </span>
      <span className="current-user-meta">
        <span className="current-user-label">Signed in as</span>
        <span className="current-user-name">{user.name}</span>
      </span>
    </button>
  );
}

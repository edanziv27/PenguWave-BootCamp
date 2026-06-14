/**
 * Surfaces data-quality issues for an event.
 * - inline: a compact warning marker (for table rows)
 * - block:  a full callout listing each issue (for the details panel)
 * Renders nothing when there are no issues.
 */
export default function DataQualityBadge({
  issues,
  inline = false,
}: {
  issues: string[];
  inline?: boolean;
}) {
  if (issues.length === 0) return null;

  if (inline) {
    return (
      <span
        className="dq-flag"
        title={issues.join("; ")}
        aria-label={`Data quality issues: ${issues.join("; ")}`}
      >
        ⚠️
      </span>
    );
  }

  return (
    <div className="dq-callout">
      <div className="dq-callout-title">⚠️ Data quality issues</div>
      <ul>
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}

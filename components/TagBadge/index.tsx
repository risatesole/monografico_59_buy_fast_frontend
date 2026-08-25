export function TagBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        border: '1px solid oklch(0.85 0 0)',
        borderRadius: 2,
        padding: '0.2rem 0.6rem',
        color: 'oklch(0.556 0 0)',
      }}
    >
      {label}
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.68rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#747781',
        marginBottom: '1.5rem',
      }}
    >
      {children}
    </p>
  );
}

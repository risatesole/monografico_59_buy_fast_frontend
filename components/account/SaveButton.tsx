export function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1.5rem',
        fontSize: '0.8rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: saved ? '#115cb9' : '#002d62',
        color: saved ? 'white' : 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'var(--font-geist-sans), sans-serif',
      }}
    >
      {saved ? 'Guardado ✓' : 'Guardar cambios'}
    </button>
  );
}

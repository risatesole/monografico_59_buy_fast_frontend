export function DownloadVoucherButton({ orderId }: { orderId: number }) {
  return (
    <a
      href={`/api/v1/customers/orders/${orderId}/voucher`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        padding: '0.5rem 1.5rem',
        fontSize: '0.8rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: '#002d62',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        textDecoration: 'none',
      }}
    >
      Descargar comprobante
    </a>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  description: 'Crea una nueva contraseña para tu cuenta',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

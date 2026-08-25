import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signup',
  description: 'Signup page',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

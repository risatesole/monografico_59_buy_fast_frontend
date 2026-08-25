import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signin',
  description: 'Signin page',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

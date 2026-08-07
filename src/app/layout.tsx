import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Callix SDK — App de demonstração',
  description: 'Softphone de demonstração construído sobre o Callix Client SDK',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

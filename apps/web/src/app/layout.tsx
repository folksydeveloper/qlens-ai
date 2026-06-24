import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'QLens AI — API Gateway for AI Models',
  description: 'Access premium AI models via a simple API. OpenAI-compatible & Anthropic-compatible endpoints.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

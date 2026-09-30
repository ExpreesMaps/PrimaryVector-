import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const sg = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });

export const metadata = {
  title: 'PrimaryVector',
  description: 'Browser web modern dengan pencarian cepat.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={sg.className}>{children}</body>
    </html>
  );
}

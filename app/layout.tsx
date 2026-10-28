import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BarrierAudit — The Skincare Circuit Breaker for Over-Actives',
  description: 'Agentic cosmetic safety copilot powered by YouCam Skin AI. Intercepts barrier collapse, runs on-device OCR, and quarantines conflicting chemical actives.',
  openGraph: {
    title: 'BarrierAudit — The Skincare Circuit Breaker',
    description: 'Stop chemical over-exfoliation. Powered by Perfect Corp YouCam Skin AI.',
    images: ['https://plugins-media.makeupar.com/strapi/assets/thumbnail_skin_analysis_06_c9136eea8f.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

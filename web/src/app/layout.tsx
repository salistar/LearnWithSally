import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const poppins = localFont({ src: [
  { path:'../../public/fonts/Poppins-Regular.ttf', weight:'400' },
  { path:'../../public/fonts/Poppins-Medium.ttf', weight:'500' },
  { path:'../../public/fonts/Poppins-SemiBold.ttf', weight:'600' },
  { path:'../../public/fonts/Poppins-Bold.ttf', weight:'700' },
], variable:'--font-poppins', display:'swap' });
export const metadata: Metadata = { title:'LearnWithSally — Votre prochaine conversation commence ici', description:'Apprenez à parler avec Sally. Six langues, des leçons courtes et une professeure IA qui vous écoute.' };
export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) {
  return <ClerkProvider appearance={{variables:{colorPrimary:'#6c4ef5',borderRadius:'16px',fontFamily:'var(--font-poppins)'}}}>
    <html lang="fr"><body className={poppins.variable}>{children}</body></html>
  </ClerkProvider>;
}

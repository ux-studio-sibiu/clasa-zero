import Script from "next/script";
import "./styles/globals.scss";
import localFont from 'next/font/local';
import ScrollBridge from "./components/client-components/scroll-bridge";

const poppins = localFont({
  src: [
    { path: './_fonts/Poppins-Regular.ttf', weight: '400', style: 'normal' },
    { path: './_fonts/Poppins-Bold.ttf', weight: '700', style: 'normal' }
  ],
  variable: '--font-poppins',
  display: 'swap',
});

const melon = localFont({
  src: [{ path: './_fonts/Melon-Pop.otf', weight: '400', style: 'normal' },],
  variable: '--font-melon',display: 'swap',
});


const coiny = localFont({
  src: [{ path: './_fonts/Coiny.ttf', weight: '400', style: 'normal' }],
  variable: '--font-coiny', display: 'swap',
});

const francoisOne = localFont({
  src: [{ path: './_fonts/Francois-One.ttf', weight: '400', style: 'normal' }],
  variable: '--font-francois-one', display: 'swap',
});

const poetsenOne = localFont({
  src: [{ path: './_fonts/Poetsen-One-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-poetsen-one', display: 'swap',
});

const sansita = localFont({
  src: [{ path: './_fonts/Sansita-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-sansita', display: 'swap',
});

const troika = localFont({
  src: [{ path: './_fonts/Troika.otf', weight: '400', style: 'normal' }],
  variable: '--font-troika', display: 'swap',
});

export default async function RootLayout({children}: {children: React.ReactNode}) {

  return (
    <html lang="ro">

    <head><link rel="icon" href="/favicon.ico" /></head>

      <body className={`${poppins.variable} ${melon.variable} ${coiny.variable} ${francoisOne.variable} ${poetsenOne.variable} ${sansita.variable} ${troika.variable} clearfix`}>
        <ScrollBridge />
          {children}
      </body>
    </html>
  );
}



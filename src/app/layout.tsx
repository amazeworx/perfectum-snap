import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Optional: if you want to use it as a CSS variable
});

export const metadata: Metadata = {
  title: 'BNI x Perfectum x OOTB',
  description: 'Capture and share your perfect moments with Perfectum.',
  openGraph: {
    title: 'BNI x Perfectum x OOTB',
    description: 'Capture and share your perfect moments with Perfectum.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Google Fonts links for Inter are not strictly necessary if using next/font, 
            but kept as per original structure if specific weights/styles were linked.
            next/font handles this more optimally.
        */}
        <link rel="icon" type="image/png" href="/images/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="BNI x Perfectum x OOTB" />
        <link rel="manifest" href="/images/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MZXS39BX');
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-slate-800">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MZXS39BX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <div className="relative max-w-[480px] mx-auto overflow-hidden">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Brady's personal bookmark archive.",
};

// Applies the saved/system theme before paint to avoid a flash. The Settings
// page writes `theme` (system | light | dark) to localStorage.
const themeInit = `(function(){try{
  var t=localStorage.getItem('theme')||'system';
  var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark',d);
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full overflow-x-hidden">{children}</body>
    </html>
  );
}

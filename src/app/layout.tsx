import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Price Compare App",
  description: "Find the best value for your money instantly by comparing price per unit.",
  icons: {
    icon: `${publicBasePath}/logo.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        {/* Background Decorative Blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
          <div className="absolute top-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-300/20 blur-[120px]" />
        </div>
        {children}
      </body>
    </html>
  );
}

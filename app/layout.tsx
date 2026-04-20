import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/app/_components/layout/Navbar";
import "./globals.css";

const fraunces = Fraunces({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono-display",
  display: "swap",
});

const isDev = process.env.NODE_ENV === "development";

export const metadata: Metadata = {
  title: {
    default: "Backyard",
    template: "%s · Backyard",
  },
  description:
    "Grants, hackathons, and build challenges with real feedback, structured milestones, and a community behind your project from day one.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.theme;if(t==='dark')document.body.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-[var(--color-border-muted)] focus:bg-[var(--bg)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:uppercase focus:tracking-wide"
        >
          Skip to main content
        </a>
        {isDev ? (
          <>
            {await import("@/app/_components/dev/RoleSwitcher").then(
              ({ RoleSwitcher }) => (
                <RoleSwitcher />
              ),
            )}
          </>
        ) : null}
        <div className="page">
          <Navbar />
          <main id="main">{children}</main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "border border-[var(--color-border-muted)] bg-[var(--bg)] text-[var(--ink)]",
            style: { borderRadius: 0 },
          }}
        />
      </body>
    </html>
  );
}

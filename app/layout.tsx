import type { Metadata } from "next";
import { AppShell } from "@/components/ui/app-shell";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spendora",
  description: "A cozy and aesthetic expense tracker.",
  manifest: "/manifest.webmanifest",
  themeColor: "#3f8f68",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spendora",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PwaProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </PwaProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Header, AgentChatPanel } from "@/components/header";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatNotificationToast } from "@/components/chat-notification-toast";
import { RestartAnnouncementBar } from "@/components/restart-announcement-bar";
import { SetupGate } from "@/components/setup-gate";
import { UsageAlertMonitor } from "@/components/usage-alert-monitor";
import { OpenClawUpdateBanner } from "@/components/openclaw-update-banner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "87 Command Center — AI Agent Dashboard",
  description:
    "87 Command Center is the AI agent dashboard for PropFirmMart. " +
    "Monitor, chat with, and manage your local AI agents, models, cron jobs, " +
    "vector memory, and skills — all from a single local AI management tool " +
    "that runs entirely on your machine.",
  keywords: [
    "87 Command Center",
    "AI agent dashboard",
    "local AI management tool",
    "PropFirmMart dashboard",
    "AI agent manager",
    "local AI assistant",
    "self-hosted AI dashboard",
    "AI agent monitoring",
    "open source AI GUI",
    "AI model management",
    "AI cron jobs",
    "vector memory dashboard",
    "LLM management tool",
    "private AI",
  ],
  manifest: "/manifest.json",
  applicationName: "87 Command Center",
  authors: [{ name: "OpenClaw" }],
  creator: "OpenClaw",
  publisher: "OpenClaw",
  category: "technology",
  openGraph: {
    type: "website",
    siteName: "87 Command Center",
    title: "87 Command Center — The AI Agent Dashboard",
    description:
      "Monitor, chat with, and manage your local AI agents from one sleek dashboard. " +
      "Open-source, self-hosted, zero cloud. The ultimate AI agent dashboard.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "87 Command Center — AI Agent Dashboard",
    description:
      "Open-source local AI management tool. Monitor agents, models, cron jobs, " +
      "vector memory and more — entirely on your machine.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "87 Command Center",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#101214",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/login";

  const fontClasses = `${inter.variable} ${geistMono.variable} antialiased`;

  if (isLoginPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        </head>
        <body className={fontClasses}>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body
        className={fontClasses}
      >
        <ThemeProvider>
          <SetupGate>
            <KeyboardShortcuts />
            <div className="flex h-screen overflow-hidden bg-stone-50 text-stone-900 dark:bg-[#101214] dark:text-stone-100">
              <Sidebar />
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header />
                <RestartAnnouncementBar />
                <main className="flex flex-1 overflow-hidden bg-stone-50 dark:bg-[#101214]">
                  {children}
                </main>
              </div>
            </div>
            <AgentChatPanel />
            <ChatNotificationToast />
            {process.env.AGENTBAY_HOSTED !== "true" && <OpenClawUpdateBanner />}
            <UsageAlertMonitor />
          </SetupGate>
        </ThemeProvider>
      </body>
    </html>
  );
}

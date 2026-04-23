import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zentra AI | Node-based AI Workflow Automation",
  description: "Foundational UI for node-based AI workflow automation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.className} antialiased transition-colors duration-300`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

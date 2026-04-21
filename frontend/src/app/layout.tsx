import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { OrgThemeProvider } from "@/components/providers/OrgThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EPMS - Employee & Project Management",
  description: "Scalable management system for modern organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OrgThemeProvider>
            {children}
          </OrgThemeProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'astra-glass border border-border text-foreground rounded-2xl p-4 font-bold text-sm shadow-2xl',
              duration: 4000,
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

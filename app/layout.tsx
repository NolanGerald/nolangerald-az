import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GyroProvider } from "./components/GyroProvider";
import GyroButton from "./components/GyroButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nolan Gerald",
  description: "Portfolio and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GyroProvider>
          {children}
          <GyroButton />
        </GyroProvider>
      </body>
    </html>
  );
}

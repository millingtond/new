// src/app/layout.tsx
// This file was updated by the project_setup.py script.

import type { Metadata } from "next"; 
import { Inter } from "next/font/google";
import "./global.css"; 
import AuthProvider from "@/components/layout/AuthProvider"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MGS CS Hub", 
  description: "MGS Computer Science Learning Platform", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

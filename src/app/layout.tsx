import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";

const inter = Inter({
    subsets: ["latin"],
    display: "swap"
});

export const metadata: Metadata = {
    title: "Intermediary Dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={inter.className}>
            <TopBar />
            <div className="flex flex-row">
                {/* We only show this on large screens */}
                <SideBar />
                <main className="flex flex-col p-12 w-full">
                    {children}
                </main>
            </div>
        </body>
    </html>
  );
}

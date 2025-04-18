import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";
import QueryClientProvider from "@/providers/QueryClientProvider";

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
        <body className={inter.className + " " + "h-auto"}>
            <TopBar />
            <div className="flex flex-row">
                {/* We only show this on large screens */}
                <SideBar />
                <main className="flex flex-col p-12 w-full">
                    <QueryClientProvider>
                        {children}
                    </QueryClientProvider>
                </main>
            </div>
        </body>
    </html>
  );
}

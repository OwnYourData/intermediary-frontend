import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";
import QueryClientProvider from "@/providers/QueryClientProvider";
import NextTopLoader from "nextjs-toploader";

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
        <body className={inter.className + " " + "h-full"}>
            <NextTopLoader
                 color="#2F99DD"
                 initialPosition={0.08}
                 height={3}
                 crawl={true}
                 easing="ease"
                 speed={200}
                 shadow="0 0 10px #2F99DD,0 0 5px #FF99DD"
                 showSpinner={false}
            />
            <TopBar />
            <div className="flex flex-row">
                <SideBar />
                <main className="flex flex-col p-12 w-full overflow-y-auto">
                    <QueryClientProvider>
                        {children}
                    </QueryClientProvider>
                </main>
            </div>
        </body>
    </html>
  );
}

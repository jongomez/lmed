import { MainProvider } from "@/components/MainProvider.client";
import { ReactNode } from "react";
import "xterm/css/xterm.css";
import "./globals.css";

export const metadata = {
  title: "lmed",
  description: "Llm based code editor",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* h-screen w-screen overflow-auto */}
      <body className="bg-dark dark:bg-slate-800 ">
        <MainProvider>{children}</MainProvider>
      </body>
    </html>
  );
}

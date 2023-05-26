import { SettingsProvider } from "@/components/SettingsProvider.client";
import "xterm/css/xterm.css";
import "./globals.css";

export const metadata = {
  title: "llmeditor",
  description: "Llm based code editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      {/* h-screen w-screen overflow-auto */}
      <body className="bg-dark dark:bg-slate-800 ">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { Inter } from "next/font/google";
import "xterm/css/xterm.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "llmcode",
  description: "Code with llms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import { Providers } from "@/components/Providers.client";
import "xterm/css/xterm.css";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

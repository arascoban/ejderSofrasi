import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ejder Sofrası Dünya Atlası",
    template: "%s | Ejder Sofrası",
  },
  description: "Ejder Sofrası evreninin kaynaklara bağlı, etkileşimli dünya atlası ve lore arşivi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#ana-icerik">İçeriğe geç</a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

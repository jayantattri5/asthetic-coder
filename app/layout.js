import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import ConvexClientProvider from "@/app/ConvexClientProvider";


export const metadata = {
  title: "AI Website Builder",
  description: "Create production ready websites in seconds with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        
      >
        <ConvexClientProvider>
        <Provider>
        {children}
        </Provider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

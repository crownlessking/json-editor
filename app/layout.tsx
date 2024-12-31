import "@/app/globals.css";
import React from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col h-screen">
          { children }
        </div>
      </body>
    </html>
  )
}

import '@/app/globals.css';
import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col h-screen">
          <AppRouterCacheProvider>
            { children }
          </AppRouterCacheProvider>
        </div>
      </body>
    </html>
  )
}

import '@/app/globals.css';
import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Kanit } from 'next/font/google';

const kanit = Kanit({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kanit',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>JSON Editor v1.0</title>
      </head>
      <body className={kanit.variable}>
        <div className="flex flex-col h-screen">
          <AppRouterCacheProvider>
            { children }
          </AppRouterCacheProvider>
        </div>
      </body>
    </html>
  )
}

'use client'

import "@/app/globals.css";
import Link from 'next/link';
import { Button } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useState, useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [ chosenFile, setChosenFile ] = useState('Choose a file');

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [ lightMode ]);

  const toggleDarkMode = () => {
    setLightMode(!lightMode);
  };

  const handleFileInput = (/*e: React.MouseEvent<HTMLButtonElement>*/) => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (file) {
          setChosenFile(file.name);
        }
      });
    }
  };

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col h-screen">
          <header className="bg-gray-300 text-white p-4 flex justify-between items-center bar">
            <div className="text-lg font-bold">
              <Link href="/">Json Editor</Link>
            </div>
            <div className="flex-grow ml-4 max-w-2xl">
              <div className="flex">
                <input type="text" placeholder="Type in file path..." className="rounded-l pl-5 h-10 w-full bg-gray-800 file" />
                <button
                  type="button"
                  onClick={handleFileInput}
                  className="bg-gray-800 border-solid rounded-r max-w-[225px] h-10 w-40 text-sm file"
                >
                  { chosenFile }
                </button>
              </div>
              <input type="file" placeholder="Open file" id="file-input" className="hidden" />
            </div>
            <div className="flex space-x-4 items-center">
              <Button
                startIcon={lightMode
                  ? <DarkModeOutlinedIcon />
                  : <LightModeOutlinedIcon sx={{'color': 'rgb(251, 191, 36)'}} />
                }
                onClick={toggleDarkMode}
                className="p-2 rounded bg-gray-800 text-white"
              />
              <button
                className="block md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
            </div>
          </header>
          <div className="flex flex-1">
            <aside className={`bg-gray-300 text-white p-4 md:block ${sidebarOpen ? 'block' : 'hidden'} w-64 bar`}>
              <div className="text-center font-bold">File history</div>
              <nav>
                <Link href="/" className="block py-2">json-file 1</Link>
                <Link href="/about" className="block py-2">json-file 2</Link>
                <Link href="/contact" className="block py-2">json-file 3</Link>
              </nav>
            </aside>
            <main className="flex-1 p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}

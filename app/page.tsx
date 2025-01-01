'use client'

import Link from 'next/link';
import { Button } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useState, useEffect } from 'react';
import JsonDataForms, { IJsonDataProps } from '@/app/ui';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
  },
});

export default function AppPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [ chosenFile, setChosenFile ] = useState('File.json');
  const [ filePath, setFilePath ] = useState('');
  const [ jsonData, setJsonData ] = useState<IJsonDataProps>({
    editable: false,
    filename: '',
    fileContent: {}
  });

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

  const handlePathInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilePath(e.target.value);
  };

  const handleFileInput = (/*e: React.MouseEvent<HTMLButtonElement>*/) => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (file) {
          setChosenFile(file.name);
          const formData = new FormData();
          formData.append('path', filePath);
          formData.append('file', file);

          fetch('/api', {
            method: 'POST',
            body: formData,
          })
            .then(response => response.json())
            .then(data => {
              console.log('File uploaded successfully:', data);
              setJsonData(data);
            })
            .catch(error => {
              console.error('Error uploading file:', error);
            });
        }
      });
    }
  };

  return (
    <ThemeProvider theme={lightMode ? lightTheme : darkTheme}>
      <header className="bg-gray-300 text-white p-4 flex justify-between items-center bar">
        <div className="text-lg font-bold">
          <Link href="/">{ chosenFile }</Link>
        </div>
        <div className="flex-grow ml-4 max-w-2xl">
          <div className="flex">
            <input
              type="text"
              placeholder="Type in file path..."
              className="rounded-l pl-5 h-10 w-full bg-gray-800 file"
              onChange={handlePathInput}
              value={filePath}
            />
            <button
              type="button"
              onClick={handleFileInput}
              className="bg-gray-800 border-solid rounded-r max-w-[225px] h-10 w-40 text-sm file"
            >Choose a file</button>
          </div>
          <input
            id="file-input"
            type="file"
            placeholder="Open file"
            accept=".json"
            className="hidden"
          />
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
          <div className="container mx-auto">
            <JsonDataForms data={jsonData} />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
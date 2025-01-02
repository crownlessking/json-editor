'use client'

import Link from 'next/link';
import { Button } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useState, useEffect } from 'react';
import JsonDataForms, { IJsonDataProps } from '@/app/ui';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { IFileInfo } from './lib/common.types';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:  '#ef3114', //'#1976d2',
    },
  },
  typography: {
    fontFamily: 'var(--font-kanit)',
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
  typography: {
    fontFamily: 'var(--font-kanit)',
  },
});

const EMPTY_JSON_DATA: IJsonDataProps = {
  editable: false,
  filename: '',
  fileContent: {}
};

export default function AppPage() {
  const [ sidebarOpen, setSidebarOpen ] = useState(false);
  const [ lightMode, setLightMode ] = useState(false);
  const [ chosenFile, setChosenFile ] = useState('Editor.json');
  const [ filePath, setFilePath ] = useState('');
  const [ jsonData, setJsonData ] = useState<IJsonDataProps>(EMPTY_JSON_DATA);
  const [ fileHistory, setFileHistory ] = useState([] as IFileInfo[]);

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [ lightMode ]);

  useEffect(() => {
    fetch('/api/file-history', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        console.log('File history retrieved successfully:', data);
        setTimeout(() => setFileHistory(data), 500);
      })
      .catch(error => {
        console.error('Error retrieving file history', error);
      });
  }, [ setFileHistory ]);

  const toggleDarkMode = () => {
    setLightMode(!lightMode);
  };

  const handlePathInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilePath(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const formData = new FormData();
      formData.append('path', filePath);
      const fileName = filePath.split('\\').pop()?.split('/').pop() || '';
      setChosenFile(fileName);

      fetch('/api', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log('Path sent successfully:', data);
          setJsonData(data);
        })
        .catch(error => {
          console.error('Error sending path:', error);
        });
    }
  }

  const handleFileInput = () => {
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

  /**
   * @param file 
   * @returns 
   */
  const handleHistoryClick = (file: IFileInfo) => (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    console.log('file info =', file);
    console.log(e.detail);

    // [TODO] Load JSON data by setting the chosenFile and filePath with
    //        values found in history item.
  }

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
              className="font-mono text-sm tracking-tight font-bold rounded-l pl-5 h-10 w-full bg-gray-800 file"
              onChange={handlePathInput}
              value={filePath}
              onKeyDown={handleKeyDown}
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
            type='button'
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
            {fileHistory.map((file, index) => (
              <div key={index} className='block group hover:bg-gray-400 p-1 rounded transition-colors duration-200 relative'>
                <button
                  className="absolute right-1 top-1 rounded hidden group-hover:block"
                  onClick={() => {
                    const updatedHistory = fileHistory.filter((_, i) => i !== index);
                    setFileHistory(updatedHistory);
                    // [TODO] Save fileHistory to server.
                  }}
                  type='button'
                  title='delete'
                >
                  <HighlightOffIcon color={lightMode ? 'warning' : 'info'} />
                </button>
                <Link onClick={handleHistoryClick(file)} href="#" className="hover:underline">
                  { index + 1 }. { file.name }
                </Link>
              </div>
            ))}
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
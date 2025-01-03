'use client'

import Link from 'next/link';
import { Button } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { useState, useEffect } from 'react';
import JsonDataForms from '@/app/ui';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { IFileInfo, IJsonDataProps, TJsonResponse, TThemeMode } from './lib/common.types';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:  '#ef3114',
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
  fileData: {},
  fileHistory: [],
  error: { code: '', message: '', name: '', stack: '' }
};

const DEFAULT_FILE_NAME = 'Editor.json';
const LOADING_MSG = 'Loading...';

export default function AppPage() {
  const [ sidebarOpen, setSidebarOpen ] = useState(false);
  const [ chosenFile, setChosenFile ] = useState(DEFAULT_FILE_NAME);
  const [ filePath, setFilePath ] = useState('');
  const [ jsonData, setJsonData ] = useState(EMPTY_JSON_DATA);
  const [ fileHistory, setFileHistory ] = useState([] as IFileInfo[]);
  const [ themeMode, setThemeMode ] = useState('light' as TThemeMode);

  useEffect(() => {
    /** Returns the chosen computer system theme. */
    const getSystemThemeMode = (): TThemeMode => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Dark mode is applied
        return 'dark';
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        // Light mode is applied
        return 'light';
      } else {
        // No preference or not supported
        return 'none';
      }
    }

    setThemeMode(getSystemThemeMode());
  }, [  ]);

  useEffect(() => {
    fetch('/api/file-history', {
      method: 'GET'
    })
      .then(response => response.json())
      .then((data: TJsonResponse) => {
        if (data) {
          setTimeout(() => setFileHistory(data.fileHistory), 500);
        }
      })
      .catch(error => {
        console.error('Error retrieving file history', error);
      });
  }, [ setFileHistory ]);

  const handleToggleThemekModeClick = () => {
    switch (themeMode) {
      case 'none':
      case 'light':
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        setThemeMode('dark');
        break;
      case 'dark':
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        setThemeMode('light');
        break;
    }
  };

  const handlePathInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilePath(e.target.value);
  };

  const handlePathInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const formData = new FormData();
      formData.append('path', filePath);
      const fileName = filePath.split('\\').pop()?.split('/').pop() || '';
      setChosenFile(LOADING_MSG);
      setJsonData(EMPTY_JSON_DATA);

      fetch('/api', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then((data: TJsonResponse) => {
          if (data && data.fileData) {
            setChosenFile(fileName);
            setJsonData(data);
            if (data.fileHistory) {
              setFileHistory(data.fileHistory);
            }
          } else {
            setChosenFile(DEFAULT_FILE_NAME);
          }
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
          const formData = new FormData();
          formData.append('path', filePath);
          formData.append('file', file);
          setChosenFile(LOADING_MSG);
          setJsonData(EMPTY_JSON_DATA);

          fetch('/api', {
            method: 'POST',
            body: formData,
          })
            .then(response => response.json())
            .then((data: TJsonResponse) => {
              if (data && data.fileData) {
                setChosenFile(file.name);
                setFilePath(filePath);
                setJsonData(data);
                if (data.fileHistory) {
                  setFileHistory(data.fileHistory);
                }
              }
            })
            .catch(error => {
              console.error('Error uploading file:', error);
            });
        }
      });
    }
  };

  const handleHistoryClick = (file: IFileInfo) => () => {
    setChosenFile(LOADING_MSG);
    setFilePath('');
    setJsonData(EMPTY_JSON_DATA);

    if (file.$path) {
      fetch('/api/file-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          $path: file.$path,
          name: file.name
        }),
      })
        .then(response => response.json())
        .then((data: TJsonResponse) => {
          if (data && data.fileData) {
            setChosenFile(file.name);
            setFilePath(file.$path);
            setJsonData(data);
            if (data.fileHistory) {
              setFileHistory(data.fileHistory);
            }
          }
        })
        .catch(error => {
          console.error('It\'s just a flesh wound...', error.stack);
        });
    } else {
      setJsonData(EMPTY_JSON_DATA);
    }
  }

  const handleHistoryDeleteClick = (index: number) => () => {
    const updatedHistory = fileHistory.filter((_, i) => i !== index);
    setFileHistory(updatedHistory);

    // Save fileHistory to server.
    fetch('/api/file-history', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedHistory),
    })
      .catch(error => {
        console.error('Error updating file history:', error);
      });
  };

  return (
    <ThemeProvider theme={themeMode === 'dark' ? darkTheme : lightTheme }>
      <header className="bg-gray-300 text-white p-4 flex justify-between items-center bar">
        <div className="text-lg font-bold">
          <Link href="#">{ chosenFile }</Link>
        </div>
        <div className="flex-grow ml-4 max-w-2xl">
          <div className="flex">
            <input
              type="text"
              placeholder="Type in file path..."
              className="font-mono text-sm tracking-tight font-bold rounded-l pl-5 h-10 w-full bg-gray-800 file"
              onChange={handlePathInput}
              value={filePath}
              onKeyDown={handlePathInputKeyDown}
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
            startIcon={themeMode === 'dark'
              ? <LightModeOutlinedIcon sx={{'color': 'rgb(251, 191, 36)'}} />
              : <DarkModeOutlinedIcon color='info' />
            }
            onClick={handleToggleThemekModeClick}
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
        <aside className={`bg-gray-300 text-white p-2 md:block ${sidebarOpen ? 'block' : 'hidden'} w-64 bar`}>
          <div className="text-center font-bold">File history</div>
          <nav>
            {fileHistory.map((file, index) => (
              <div key={index} className='block group hover:bg-historyHover rounded transition-colors duration-200 relative history'>
                <button
                  className="absolute right-0 top-[-1px] rounded hidden group-hover:block"
                  onClick={handleHistoryDeleteClick(index)}
                  type='button'
                  title='delete'
                >
                  <ClearIcon 
                    color={themeMode === 'dark' ? 'info' : 'warning' }
                    sx={{ fontSize: '1.1rem' }}
                  />
                </button>
                <Link onClick={handleHistoryClick(file)} href="#">
                  <span className={file.missing ? 'ml-2 line-through missing-file' : 'ml-2'}>
                    { index + 1 }. { file.name }
                  </span>
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
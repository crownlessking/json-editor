import path from 'path';
import { promises as fs } from 'fs';
import { IError, IFileInfo, TJsonResponse } from '../lib/common.types';
import { IJsonapiError } from '../lib/IJsonapi';
import appConfig, { apply_file_history_config } from './app.config';

export const JSON_FILE_HISTORY = 'json-file-history.json';
export const FILE_HISTORY_PATH = path.join(process.cwd(), JSON_FILE_HISTORY);

export function getEmptyJsonResponse(): TJsonResponse {
  return {
    editable: false,
    fileData: {},
    filename: '',
    fileHistory: [],
    error: {
      code: '',
      name: '',
      message: '',
      stack: ''
    }
  }
}

export const generic_500_response = () => new Response(JSON.stringify({
  editable: false,
  filename: '',
  fileContent: {},
  error: [{
    code: 'internal-server-error',
    title: 'Internal Server Error',
    detail: 'Reached the end of the function without returning a proper response.'
  } as IJsonapiError]
}), { status: 500 });

/**
 * Load the file history.
 */
export async function get_file_history(): Promise<IFileInfo[]> {
  const history: IFileInfo[] = [];

  try {
    const fileHistoryContent = await fs.readFile(FILE_HISTORY_PATH, 'utf-8');
    const historyFromFile = JSON.parse(fileHistoryContent);
    history.push(...historyFromFile);
  } catch (e) {
    if ((e as IError).code !== 'ENOENT') {
      throw e;
    }
  }
  return history;
}

/**
 * Populates and reorganizes the file history.
 */
export async function set_file_history(
  $path: string,
  name: string
): Promise<IFileInfo[]> {
  const history = await get_file_history();
  let fileExist = false;
  const sanitizedPath = $path.replace(/(\\|\/)$/g, '');

  history.map(async (file, i) => {
    // if file is already in the history array, move it to the beginning.
    
    if (file.$path === sanitizedPath && file.name === name) {
      fileExist = true;
      file.missing = false;
      history.splice(i, 1);
      history.unshift(file);
    }
  
  });
  
  if (fileExist) {
    await fs.writeFile(FILE_HISTORY_PATH, JSON.stringify(history, null, 2));
    return history;
  }

  if (history.length > appConfig.historyLimit) {
    history.pop();
  }

  if ($path && name) {
    const fileInfo = {
      $path: sanitizedPath,
      name,
      missing: false
    };
    apply_file_history_config(fileInfo);
    history.unshift(fileInfo);
    await fs.writeFile(FILE_HISTORY_PATH, JSON.stringify(history, null, 2));
  }

  return history;
}
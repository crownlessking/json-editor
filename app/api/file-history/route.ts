import path from 'path';
import { IError, IFileInfo } from '@/app/lib/common.types';
import { promises as fs } from 'fs';
import {
  FILE_HISTORY_PATH,
  get_file_history,
  getEmptyJsonResponse,
  JSON_FILE_HISTORY,
  set_file_history
} from '../common.logic';



/**
 * Get the array index of the missing file.
 */
async function mark_file_as_missing($path: string, name: string): Promise<IFileInfo[]> {
  const fileHistory = await get_file_history();
  let foundMissing = false;

  fileHistory.map(fileData => {
    if (fileData.$path === $path && fileData.name === name) {
      fileData.missing = foundMissing = true;
    }
  });

  if (foundMissing) {
    try {
      await fs.writeFile(FILE_HISTORY_PATH, JSON.stringify(fileHistory, null, 2));
    } catch (e) {
      console.log('Failed to update history on missing file', (e as IError).stack);
    }
  }

  return fileHistory;
}

/**
 * Get the file history.
 */
export async function GET() {
  const filePath = JSON_FILE_HISTORY;
  const res = getEmptyJsonResponse();
  try {
    await fs.access(filePath);
  } catch (e) {
    res.error.code = '404';
    res.error.message = (e as IError).message;
    return new Response(JSON.stringify(res), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  }
  const fileStr = await fs.readFile(filePath, 'utf-8');
  const fileHistory = JSON.parse(fileStr) as IFileInfo[];
  res.fileHistory = fileHistory;
  return new Response(JSON.stringify(res), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

/**
 * Updates the file history.
 */
export async function PUT(request: Request) {
  const filePath = JSON_FILE_HISTORY;
  const body = await request.json();

  try {
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');
    return new Response(null, { status: 204 });
  } catch (e) {
    const res = getEmptyJsonResponse();
    res.error.message = 'Failed to update file';
    res.error.stack = (e as IError).stack;
    return new Response(JSON.stringify(res), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

/**
 * Load a file from history.
 */
export async function POST(request: Request) {
  const { $path, name } = await request.json();
  try {
    const res = getEmptyJsonResponse();
    const stat = await fs.stat($path);
    if (stat.isDirectory()) {
      const filename = `${$path}/${name}`;
      const fileStr = await fs.readFile(filename, 'utf-8');
      const fileHistory = await set_file_history($path, name);
      res.fileData = JSON.parse(fileStr);
      res.editable = true;
      res.filename = filename;
      res.fileHistory = fileHistory;
      return new Response(JSON.stringify(res), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      const fileStr = await fs.readFile($path, 'utf-8');
      const fileHistory = await set_file_history(path.dirname($path), name);
      res.fileData = JSON.parse(fileStr);
      res.filename = $path;
      res.editable = true;
      res.fileHistory = fileHistory;
      return new Response(JSON.stringify(res), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
  } catch (e) {
    const updatedFileHistory = await mark_file_as_missing($path, name);
    const res = getEmptyJsonResponse();
    res.fileHistory = updatedFileHistory;
    res.error.code = '400';
    res.error.stack = (e as IError).stack;
    return new Response(JSON.stringify(res), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}
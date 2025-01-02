import { promises as fs } from 'fs';
import path from 'path';
import { IJsonapiError } from '../lib/IJsonapi';
import { IError, IFileInfo } from '../lib/common.types';

/**
 * Keeps a list of JSON files which were accessed.
 *
 * @param $path 
 * @param name 
 * @returns 
 */
async function set_file_history($path: string, name: string) {
  const history: IFileInfo[] = [];

  const historyFilePath = path.join(process.cwd(), 'json-file-history.json');

  try {
    const historyData = await fs.readFile(historyFilePath, 'utf-8');
    const savedHistory = JSON.parse(historyData);
    history.push(...savedHistory);
  } catch (e) {
    if ((e as IError).code !== 'ENOENT') {
      throw e;
    }
  }

  let fileExist = false;
  history.map(file => {
    if (file.$path === $path && file.name === name) {
      fileExist = true;
    }
  });

  if (fileExist) {
    return;
  }

  const newFile: IFileInfo = { $path, name, missing: false };

  if (history.length > 30) {
    history.pop();
  }

  history.unshift(newFile);
  await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));
}

export async function POST(request: Request) {
  const error = {} as IJsonapiError;
  const data = await request.formData();
  const $path = data.get('path') as string ?? '';

  // If $path is a valid file path then retrieve and return it.
  // And editing is allowed.
  try {
    const stat = await fs.stat($path);
    if (stat.isFile()) {
      const fileContent = await fs.readFile($path, 'utf-8');
      const fileName = path.basename($path);
      const fileExtension = path.extname($path);
      set_file_history($path, fileName + fileExtension);
      return new Response(JSON.stringify({
        editable: true,
        filename: $path,
        fileContent: JSON.parse(fileContent)
      }), { status: 200 });
    }
  } catch (e) {
    if ((e as IError).code === 'ENOENT') {
      error.code = 'ENOENT';
      error.title = 'Provided path does not exist';
      error.status = '404';
    } else {
      // throw e;
      error.title = (e as IError).message;
      error.detail = (e as IError).stack;
    }
  }

  const file = data.get('file') as File;

  // If file is located in the directory indicated by $path, editing is allowed.
  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = path.join($path, file.name);

    try {
      await fs.access(filename);
      set_file_history($path, file.name);
      return new Response(JSON.stringify({
        editable: true,
        filename,
        fileContent: JSON.parse(buffer.toString('utf-8')),
        error: [ error ]
      }), { status: 200 });
    } catch (e) {
      if ((e as IError).code === 'ENOENT') {
        return new Response(JSON.stringify({
          editable: false,
          filename: '',
          fileContent: JSON.parse(buffer.toString('utf-8')),
          error: [ {
            code: 'ENOENT',
            title: (e as IError).message,
            detail: (e as IError).stack
          } as IJsonapiError ]
        }), { status: 404 });
      } else {
        throw e;
      }
    }
  }

}

/**
 * Save uploaded file to the current directory.
 *
 * **NOTICE:** This function is an example and can be removed at any time.
 *
 * @param file 
 */
export async function save_file_to_current_directory(file: File) {
  const filePath = path.join(process.cwd(), file.name);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);
}

/**
 * API route to save/update the JSON file content.
 *
 * @param request 
 * @returns 
 */
export async function PUT(request: Request) {
  const data = await request.json();
  const { filename, fileContent } = data;

  if (!filename || !fileContent) {
    return new Response(
      JSON.stringify({
        error: 'Filename or file content not provided'
      }), { status: 400 }
    );
  }

  try {
    await fs.writeFile(filename, JSON.stringify(fileContent, null, 2));
    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: 'Failed to save file',
        name: (e as IError).name,
        stack: (e as IError).stack
      }), { status: 500 }
    );
  }
}

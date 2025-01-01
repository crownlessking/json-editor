import { promises as fs } from 'fs';
import path from 'path';

interface IError {
  code: string;
  message: string;
  name: string;
  stack: string;
}

interface IFileInfo {
  $path: string;
  name: string;
  missing: boolean;
}

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
  const data = await request.formData();
  const $path = data.get('path') as string;
  const file = data.get('file') as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file && $path) {
    const filename = path.join($path, file.name);

    try {
      await fs.access(filename);
      console.log('Filename: ', filename);
      set_file_history($path, file.name);
    } catch (e) {
      if ((e as IError).code === 'ENOENT') {
        return new Response(JSON.stringify({
          editable: false,
          filename: '',
          fileContent: JSON.parse(buffer.toString('utf-8'))
        }), { status: 404 });
      } else {
        throw e;
      }
    }

    return new Response(JSON.stringify({
      editable: true,
      filename,
      fileContent: JSON.parse(buffer.toString('utf-8'))
    }), { status: 200 });

  } else if (file && !$path) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Response(JSON.stringify({
      editable: false,
      filename: '',
      fileContent: JSON.parse(buffer.toString('utf-8'))
    }), { status: 200 });

  } else {
    return new Response(
      JSON.stringify({
        error: 'No file or path provided'
      }), { status: 400 }
    );
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
    return new Response(
      JSON.stringify({
        message: 'File saved successfully'
      }), { status: 204 }
    );
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
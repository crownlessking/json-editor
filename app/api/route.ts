import { promises as fs } from 'fs';
import path from 'path';
import { IError, TJsonResponse } from '../lib/common.types';
import {
  generic_500_response,
  get_file_history,
  getEmptyJsonResponse,
  set_file_history
} from './common.logic';

/**
 * Loads a JSON file.
 */
export async function POST(request: Request): Promise<Response> {
  const data = await request.formData();
  const $path = data.get('path') as string ?? '';
  const file = data.get('file') as File;
  const res = getEmptyJsonResponse();
  
  // If $path is a valid file path then editing is allowed.
  try {
    const stat = await fs.stat($path);
    if (stat.isFile()) {
      const fileStr = await fs.readFile($path, 'utf-8');
      path.dirname($path);
      const fileName = path.basename($path);
      const fileHistory = await set_file_history(path.dirname($path), fileName);
      res.editable = true;
      res.filename = $path;
      res.fileData = JSON.parse(fileStr);
      res.fileHistory = fileHistory;
      return new Response(JSON.stringify(res), { status: 200 });

    // If $path is a valid directory path and the JSON file is located within
    // editing is allowed.
    } else if (stat.isDirectory()) {
      res.filename = path.join($path, file.name);
      const fileStr = await fs.readFile(res.filename, 'utf-8');
      res.fileData = JSON.parse(fileStr);
      res.editable = true;
      res.fileHistory = await set_file_history($path, file.name);
      return new Response(JSON.stringify(res), { status: 200 });
    }
  } catch (e) {
    if ((e as IError).code === 'ENOENT') {
      res.error.code = 'ENOENT';
      res.error.message = 'Provided path does not exist';
    } else {
      // throw e;
      res.error.message = (e as IError).message;
      res.error.stack = (e as IError).stack;
    }
  }

  // Return chosen file data in response. Editing is not allowed.
  if (file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.fileData = JSON.parse(buffer.toString('utf-8'));
      res.fileHistory = await get_file_history();
      return new Response(JSON.stringify(res), { status: 200 });
    } catch (e) {
      if ((e as IError).code === 'ENOENT') {
        res.error.code = 'ENOENT';
        res.error.message = (e as IError).message;
        res.error.stack = (e as IError).stack;
        return new Response(JSON.stringify(res), { status: 404 });
      } else {
        throw e;
      }
    }
  }

  return generic_500_response();
}

/**
 * Updates the JSON file content.
 *
 * @param request 
 * @returns 
 */
export async function PUT(request: Request): Promise<Response> {
  const res = getEmptyJsonResponse();
  const data: TJsonResponse = await request.json();
  const { filename, fileData } = data;

  if (!filename || !fileData) {
    res.error.message = 'Filename or file content not provided';
    return new Response(
      JSON.stringify(res), { status: 400 }
    );
  }

  try {
    await fs.writeFile(filename, JSON.stringify(fileData, null, 2));
    return new Response(null, { status: 204 });
  } catch (e) {
    res.error.message = 'Failed to save file';
    res.error.name = (e as IError).name;
    res.error.stack = (e as IError).stack;
    return new Response(
      JSON.stringify(res), { status: 500 }
    );
  }
}

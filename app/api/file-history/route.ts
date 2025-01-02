import { IError } from '@/app/lib/common.types';
import { promises as fs } from 'fs';


export async function GET() {
  const filePath = 'json-file-history.json';
  try {
    await fs.access(filePath);
  } catch (e) {
    return new Response(JSON.stringify({
      error: 'File not found',
      stack: (e as IError).stack
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  }
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  return new Response(JSON.stringify(jsonData), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

/** Make properties optional */
export type TOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface IFileInfo {
  $path: string;
  name: string;
  filename?: string;
  missing: boolean;
}

export interface IError {
  code: string;
  message: string;
  name: string;
  stack: string;
}
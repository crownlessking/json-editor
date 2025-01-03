
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

export type TThemeMode = 'light' | 'dark' | 'none';

export interface IJsonData {
  [prop: string]: string | number | boolean | IJsonData;
}

export interface IJsonDataProps {
  editable: boolean;
  filename: string;
  fileData: IJsonData;
  fileHistory: IFileInfo[];
  error: IError
}

/** JSON data response. Alias for JSON data props */
export type TJsonResponse = IJsonDataProps;
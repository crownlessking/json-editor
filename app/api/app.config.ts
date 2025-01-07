import {promises as fs} from 'fs';
import path from 'path';
import { IAppConfig, IError, IFileInfo } from '../lib/common.types';

/**
 * Settings example:
 * 
 * Path aliases generates an alias based on folder names in the file path.
 * A value of 1 for the level is the parent folder of the currently chosen 
 * file.
 * 2 would be the folder above it and so forth.
 *
 * ```json
 * {
 *   "pathAliases": {
 *     "somefile.json": {
 *       "level": 1, // folder level
 *       "regex": "" // Regular expression
 *     }
 *   }
 * }
 * ```
 *
 * Conversely, you can directly define the file name alias:
 * ```json
 * {
 *   "aliases": {
 *     "somefile.json": ""
 *   }
 * }
 * ```
 */
const DEFAULT_CONFIG = {
  'historyLimit': 30,
  'pathAliases': {},
  'aliases': {}
} as IAppConfig;

const configPath = path.resolve('editor.config.json');

try {
  await fs.access(configPath);
} catch (error) {
  console.log((error as IError).message);
  console.log('Creating configuration file.');
  await fs.writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

const rawData = await fs.readFile(configPath, 'utf-8');
const appConfig = {...DEFAULT_CONFIG, ...JSON.parse(rawData)} as IAppConfig;

export default appConfig;

/** Apply configuration from file */
export function apply_file_history_config(fileInfo: IFileInfo): IFileInfo {
  const { name } = fileInfo;
  const alias = appConfig.aliases[name];
  if (alias) {
    fileInfo.alias = alias;
    return fileInfo;
  }
  if (appConfig.pathAliases[name]) {
    const pathAlias = {
      level: 1,
      regex: '',
      ...appConfig.pathAliases[name]
    };
    const { level, regex } = pathAlias;console.log('regex:', regex);
    const directories = fileInfo.$path.split(/\\|\//g);
    if (directories.length >= 2) {
      const directoryName = directories[directories.length - level];
      const alias = regex
        ? directoryName.match(new RegExp(regex))
        : directoryName;
      switch (typeof alias) {
        case 'object':
          if (alias) {
            fileInfo.alias = alias[0];
          }
          break;
        case 'string':
          fileInfo.alias = alias;
          break;
        default:
      }
    }
  }
  return fileInfo;
}

export function apply_file_history_config_all(history: IFileInfo[]): void {
  history.map(fileInfo => {
    return apply_file_history_config(fileInfo);
  });
}

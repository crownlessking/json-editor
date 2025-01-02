
import Link from 'next/link';
import { IFileInfo } from '../lib/common.types';


export default function FileHistoryItem ({ name }: IFileInfo) {
  return (
    <div className='block py-2'>
      <Link href=''>{ name }</Link>
    </div>
  );
}
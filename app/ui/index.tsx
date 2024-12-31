
interface IJsonData {
  [prop: string]: string | number | IJsonData;
}

export interface IJsonDataProps {
  editable: boolean;
  filename: string;
  fileContent: IJsonData;
}

interface IProps {
  data: IJsonDataProps
}

export default function JsonDataForms({ data }: IProps) {
  console.log('JsonDataForms =', data);
  return (
    <div className="flex flex-wrap">
      <div className="w-full md:w-1/2 p-2 min-w-[350px]">
        1 of 2
      </div>
      <div className="w-full md:w-1/2 p-2 min-w-[350px] js-card">
        2 of 2
      </div>
    </div>
  );
}
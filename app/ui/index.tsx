import { JSX, useState } from 'react';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface IJsonData {
  [prop: string]: string | number | boolean | IJsonData;
}

export interface IJsonDataProps {
  editable: boolean;
  filename: string;
  fileContent: IJsonData;
}

interface IProps {
  data: IJsonDataProps
}

interface IFieldProps {
  data: IJsonDataProps;
  obj: IJsonData;
  prop: string;
  index: number
}

/**
 * Convert a filename into a title.
 *
 * @param label 
 * @returns 
 */
const formatLabel = (label: string) => {
  return label
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Convert camelCase to space
    .replace(/_/g, ' ') // Convert underscores to space
    .replace(/\.[^/.]+$/, '') // Remove file extensions
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
};

/**
 * Convert a JSON property into an HTML id attribute.
 *
 * @param prop 
 * @returns 
 */
const convertToId = (prop: string) => {
  return prop
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .replace(/_/g, '-') // Convert underscores to hyphens
    .toLowerCase(); // Convert to lowercase
};

/**
 * Apply background on odd number partial form.
 *
 * @param odd 
 * @returns 
 */
const bgStyle = (odd = 1) => {
  return odd % 2 === 0 ? 'js-card' : '';
}

/**
 * Save changes to JSON file.
 *
 * @param fileContent 
 * @param filename 
 */
const saveJSON = (fileContent: IJsonData, filename: string) => {
  setTimeout(() => {
    fetch('/api', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileContent, filename }),
    })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));
  }, 100);
}

/**
 * Field to edit a JSON boolean property.
 */
const EditBoolean = ({ data, obj, prop, index: i }: IFieldProps) => {
  const [ value, setValue ] = useState(obj[prop] as boolean);
  const id = `${convertToId(prop)}-${i}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.checked);
      obj[prop] = e.target.checked;
      const { filename, fileContent } = data;
      saveJSON(fileContent, filename);
  }

  return (
    <div className="w-full">

        <FormControlLabel
          id={id}
          control={
            <Switch
              disabled={!data.editable}
              checked={value}
              onChange={handleChange}
            />
          }
          label={formatLabel(prop)}
        />

    </div>
  );
}

/**
 * Field to edit a JSON string property.
 */
const EditString = ({ data, obj, prop, index: i }: IFieldProps) => {
  const [value, setValue] = useState(obj[prop] as string);
  const id = `${convertToId(prop)}-${i}`;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    obj[prop] = e.target.value;
    const { filename, fileContent } = data;
    saveJSON(fileContent, filename);
  };

  return (

        <TextField
          id={id}
          label={formatLabel(prop)}
          variant="standard"
          type="text"
          value={value}
          onBlur={handleBlur}
          disabled={!data.editable}
          fullWidth
        />

  );
};

const EditNumber = ({ data, obj, prop, index: i }: IFieldProps) => {
  const [value, setValue] = useState(obj[prop] as number);
  const id = `${convertToId(prop)}-${i}`;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    obj[prop] = newValue;
    const { filename, fileContent } = data;
    saveJSON(fileContent, filename);
  };

  return (

      <TextField
        id={id}
        label={formatLabel(prop)}
        variant="standard"
        type="number"
        value={value}
        onBlur={handleBlur}
        disabled={!data.editable}
        fullWidth
      />

  );
};

const FormBuilder = ({ data, obj, prop: formName }: IFieldProps) => {
  const stack: IJsonData[] = [];
  const propStack: string[] = [];
  const fieldList: ( JSX.Element | null )[] = [];
  let i = 0;
  stack.push(obj);
  propStack.push(formName);

  do {
    const formName = propStack.shift() ?? '';
    const stackedObj = stack.shift();

    if (stackedObj) {
      const subFieldList: (JSX.Element | null)[] = Object.keys(stackedObj).map((key) => {
        const value = stackedObj[key];console.log(`stackedObj[${key}] =`, value);
        switch (typeof value) {
          case 'boolean':
            return (
              <EditBoolean
                index={i}
                key={key}
                data={data}
                obj={stackedObj}
                prop={key}
              />
            );
          case 'string':
            if (value === 'true' || 'false' === value) {
              return (
                <EditBoolean
                  index={i}
                  key={key}
                  data={data}
                  obj={stackedObj}
                  prop={key}
                />
              );
            } else if (!isNaN(Number(value))) {
              return (
                <EditNumber
                  index={i}
                  key={key}
                  data={data}
                  obj={stackedObj}
                  prop={key}
                />
              );
            } else {
              return (
                <EditString
                  index={i}
                  key={key}
                  data={data}
                  obj={stackedObj}
                  prop={key}
                />
              );
            }
          case 'number':
            return (
              <EditNumber
                index={i}
                key={key}
                data={data}
                obj={stackedObj}
                prop={key}
              />
            );
          case 'object':
            if (value !== null && !Array.isArray(value)) {
              stack.push(value);
              propStack.push(key);
            }
            break;
          default:
        }
        return null;
      });
      fieldList.push(
        <div key={formName}
          className={`p-3 col-span-1 ${bgStyle(i)}`}
        >
          <h2 className='text-center'>{ formatLabel(formName) }</h2>
          { subFieldList }
        </div>
      );
    }

    i++;
  } while (stack.length > 0);

  return fieldList;
}

export default function JsonDataForms({ data }: IProps) {
  if (Object.keys(data.fileContent).length > 0) {
    const lastSlashIndex = data.filename.lastIndexOf('/');
    const prop = formatLabel(data.filename.substring(lastSlashIndex + 1));
    console.log('data =', data);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormBuilder index={0} data={data} obj={data.fileContent} prop={prop} />
      </div>
    );
  }

  return ( null );
}

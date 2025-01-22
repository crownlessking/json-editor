# JSON Editor

This is a [Next.js](https://nextjs.org/) app that allows you to edit your JSON files using a web interface. It's a web page that is ran on your local computer and not on the internet.

## Requirements

* [Node.js 18.18](https://nodejs.org/) or later
* [npm 11.0](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or later

## How to Use

Download the file, unzip it to the location of your choosing. Navigate to the unzipped folder and open a terminal from that folder and run:

```sh
npm i
```

Once *npm* has finished it's installation, you can run the app with the following command:

```sh
npm start
```

Whenever you need to using it. The terminal will indicate which URL address to use to access the app.

## Editing a JSON file

The file will **not** be editable if you do not specify the path to the parent folder in the text field.

To open a JSON file for editing, you **must** specify the path of the folder where the file is located before choosing to open it using the button. Alternatively, you can paste-in the full path of the file and press [enter] and it will be opened for editing immediately.

## WARNING!

The edits made using this app are save almost instantaneously. Make sure you backup your JSON files before editing them. I am not responsible for any damage incured from using this app. Use it at your own risk.

## Config File

When the web app server runs the first time, it will create a default JSON config file if there's none. The following is an example of default setting:

```json
{
  "historyLimit": 30,
  "pathAliases": {},
  "aliases": {}
}
```

### `pathAliases`: File History Path Aliases

When you open a JSON file, it will be added to the file history by its name, without the extension. However, it is possible for you to have several JSON files with the same name in different folders. That is where `pathAliases` can help.

It will give an alias to your JSON file name in the file history based on its parent folders. Essentially, your JSON file will be given the name of its parent folder or a portion of it instead of its actual name in the file history.

```JSON
{
  "pathAliases": {
    "example-file-name.json": {
      "level": 1,
      "regex": ""
    }
  }
}
```

In this JSON example, the file `example-file-name.json` will be given the name of its immediate parent folder `level: 1`. `level: 2` would be the grand-parent folder and so forth. You can also set a `regular-expression` to use a portion of the parent folder name. However, that's for advance users who are familiar with regular expressions.

### `aliases`: File History Aliases

This option is similar to `pathAliases` but it's simpler. It allows you to set the JSON file alias directly.

```JSON
{
  "aliases": {
    "example-file-name.json": "alias-name"
  }
}
```

In this JSON example, the file `example-file-name.json` will be renamed to `alias-name` in the file history.

### `historyLimit`: File History Limit

```json
{
  "historyLimit": "30"
}
```
This option allows you to set the *file history limit* which is `30` by default, if you want the file history to be shorter or longer.
# JSON Editor

This is a [Next.js](https://nextjs.org/) app that allows you to edit your JSON files using a web interface. It's a web page that is ran on your local computer and not on the internet.

## Requirements

* [Node.js 18.18](https://nodejs.org/) or later
* [npm 11.0](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or later

## How to Use

Download the file, unzip it to the location of your choosing. Navigate to the unzipped folder, "json-editor-0.1" (unless you've named it something else), open a terminal from that folder and run:

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

To open a JSON file for editing, you **must** specify the path of the folder where the file is located before choosing to open it using the button. Alternatively, you can enter the full path of the file and it will be opened for editing immediately.

## WARNING!

The edits made using this app are save almost instantaneously. Make sure you backup your JSON files before editing them. I am not responsible for any damage incured from using this app. Use it at your own risk.
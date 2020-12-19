# Speed Reader

A Firefox extension to help you read faster and more thoroughly.

![in-action](https://user-images.githubusercontent.com/33415/102681160-f326a880-419d-11eb-862d-785e88e3339e.gif)

There are other extensions that do the same, but none for Firefox that doesn't require signing in.

## Usage

Simply select the text you want to speed-read and click the extension button.

### Hotkeys

|Button|Action|
|-|-|
|Spacebar|Toggle pause|
|Escape|Close it|
|Arrow Up|Speed Up|
|Arrow Down|Speed Down|
|Arrow Left|Previous word (useful when paused)|
|Arrow Right|Next word (useful when paused)|

You can also click anywhere on the background to close it.

## Development

```
yarn

yarn start
```

There is a sample html file so that it is not necessary to test it in the context of a Firefox extension.

Run tests with:

```
yarn test
```

### Building

```
yarn build
```

Creates a `build/speed-reader.js` file that's ready to be executed.

It is possible to simply add that file as a bookmarklet to achieve the same result as installing the extension.

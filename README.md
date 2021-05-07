## Overview

This is a basic react based Chrome browser extension. Clone this repo to create a custom react based Chrome browser extension.

## Steps to Create a React Chrome Extension From Scratch

1. Run:
```console
npx create-react-app base-react-chrome-extension
```
2. Open in Visual Studio Code
3. Click the cloud with up arrow in lower left and publish to github
4. Modify manifest.json:

```json
{
  "name": "Base Chrome Extension",
  "version": "1.0",
  "manifest_version": 2,
  "browser_action": {
      "default_popup": "index.html"
  },
  "content_security_policy": "script-src 'self' 'sha256-t4DzZ9Z2fVUWgrxpX0ew14gHfp3ZGwfaXpHOPgI8J+w='; object-src 'self'"
}
```

> :warning: For the extension popup menu page to function properly the *sha256* value of the **content_security_policy** must be updated to the appropriate value whenever you make changes.

5. Build the app by executing:
```console
yarn build
``` 
The extension files will be located in the `<PROJECT_HOME>/build` folder


6. Add the extension to Chrome
   1. Browse to `chrome://extensions`
   2. Turn on `Developer Mode` to enable loading of extensions locally
   3. Click `Load unpacked` and browse to `<PROJECT_HOME>/build` 
7. Pin the extension in the Chrome extensions toolbar
   1.  Open the extensions menu by clicking the Extensions (puzzle) icon next to the browser address bar 
   2. Pin the extension to the toolbar by clicking the pushpin next to `My Extension`
8. Open the extension popup menu by clicking the extension's icon in the extension tool bar
9. If you just see a blank box instead of the react page, you may need to update the *sha256* value of the **content_security_policy** in `manifest.json`
    1. Browse to `chrome://extensions/`
    2. Find `My Extension` and click the `Errors` button
    3. Find the appropriate hash value in the error message and update the **content_security_policy** with this value
    4. Rebuild the extension by executing:
    ```console
    yarn build
    ``` 
    5. Click the `Clear all` button to clear the error
    6. Click the back arrow to the left of `Errors`
    7. Reload the extension by clicking its `Refresh` icon
    8. Click the extension icon in the extensions toolbar and verify the react page displays as expected


## Injecting React into a page via content script

> :warning: create-react-app will generate different names for the output JS file whenever the content is changed. This prevents us from being able to statically reference the content script by name in the manifest.json file. To work around this we will eject from create-react-app.

1. Run:
```console
yarn run eject
```
2. To install dependencies, run:
```console
yarn install
```
3. Open `config/webpack.config.js`
4. To fix the script file names, delete all istances of `[hash:8].` and `[contenthash:8].` from this file

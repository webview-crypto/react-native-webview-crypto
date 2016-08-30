# react-native-webview-crypto

[![npm](https://img.shields.io/npm/v/react-native-webview-crypto.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/react-native-webview-crypto)
[![Dependency Status](https://dependencyci.com/github/saulshanabrook/react-native-webview-crypto/badge)](https://dependencyci.com/github/saulshanabrook/react-native-webview-crypto)

This brings `window.Crypto` to your React Native application. It does this
by communicating with a hidden WebView, which performs the actual
computation.

Refer to the [`webview-crypto`](https://github.com/saulshanabrook/webview-crypto)
repo for most of the code and some cavaets.


## Install

1. [Get started with React Native](https://facebook.github.io/react-native/docs/getting-started.html)
2. Install [React Native WebView Javascript Bridge](https://github.com/alinz/react-native-webview-bridge)
   and verify that it is working for your platform.
3. `npm install --save react-native-webview-crypto`


## Quickstart

Rendering the `PolyfillCrypto` will start up a WebView to transparently proxy
all the crypto calls to.

```javascript
import React, { Component } from 'react';
import { View } from 'react-native';

import App from './app';

import PolyfillCrypto from 'react-native-webview-crypto';

class TopLevelComponent extends Component {
  render() {
    // set`debug` prop to `true` to have it print to the console as it runs
    return (
      <View>
        <PolyfillCrypto />
        <App />
      </View>
    );
  }
}

AppRegistry.registerComponent('WhateverName', () => TopLevelComponent);
```

Now, in any of your code, you can access `window.crypto`, just like you would
in a browser.

There is also an [example repo](https://github.com/saulshanabrook/react-native-webview-crypto-example)
which runs some example crypto using this library.

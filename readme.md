# react-native-webview-crypto

[![npm](https://img.shields.io/npm/v/react-native-webview-crypto?style=flat-square)](https://www.npmjs.com/package/react-native-webview-crypto)

Working version based on /saulshanabrook/react-native-webview-crypto and PR https://github.com/webview-crypto/react-native-webview-crypto/pull/9

This brings `window.crypto.subtle` to your React Native application. It does this by communicating with a hidden WebView, which performs the actual computation.

Refer to the [`webview-crypto`](https://github.com/webview-crypto/webview-crypto) repo for most of the code and some caveats.

## Installation

```sh
npm install --save react-native-webview react-native-webview-crypto
react-native link
```

### Android

create a file called blank.html in android/app/src/main/assets

```
<html/>
```

### known issues

if you use react-native-crypto and get warnings about cyclic require make sure to import it before the bridge

```
import 'react-native-crypto'
import WebviewCrypto from 'react-native-webview-crypto'
```

### getRandomValues

for complete compatability with webcrypto (window.crypto.getRandomValues) you can install react-native-crytpo or react-native-get-random-values

## Usage

Rendering the `PolyfillCrypto` will start up a WebView to transparently proxy all the crypto calls to.

```javascript
import React, { Component } from 'react'
import { View } from 'react-native'

import App from './app'

import PolyfillCrypto from 'react-native-webview-crypto'

class TopLevelComponent extends Component {
  render() {
    return (
      <View>
        <PolyfillCrypto />
        <App />
      </View>
    )
  }
}

AppRegistry.registerComponent('WhateverName', () => TopLevelComponent)
```

Now, in any of your code, you can access `window.crypto.subtle`, just like you would in a browser.

[Example repo](https://github.com/gooddollar/gun-webcrypto-react-native)
There is also an [example repo](https://github.com/webview-crypto/react-native-webview-crypto-example) which runs some example crypto using this library.

_This project was funded by [Burke Software and Consulting LLC](http://burkesoftware.com/) for [passit](http://passit.io/)._

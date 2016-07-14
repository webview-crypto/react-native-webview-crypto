# react-native-crypto

[![Build Status](https://travis-ci.org/saulshanabrook/react-native-crypto.svg?branch=master)](https://travis-ci.org/saulshanabrook/react-native-crypto)
[![Build Status](https://saucelabs.com/browser-matrix/sshanabrook.svg)](https://saucelabs.com/beta/builds/e5a789ac690b406aaa3494e42a093d3c)
[![Dependency Status](https://dependencyci.com/github/saulshanabrook/react-native-crypto/badge)](https://dependencyci.com/github/saulshanabrook/react-native-crypto)

This brings `window.Crypto` to your React Native application. It does this
by communicating with a hidden WebView, which performs the actual
computation.

## Why does this exist?

The [Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
is [implemented in all major browsers](http://caniuse.com/#feat=cryptography)
and provides performant and secure way of doing client side encryrption in
JavaScript. However, it is [not supported in the React Native JavaScript runtime](https://github.com/facebook/react-native/issues/1189).

Android and iOS browsers do support `window.crypto`.
This library makes use of their implementations. It creates a hidden WebView
and communicates with it asynchronously. It provides an object
that fulfills the [`Crypto`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)
interface, that can serve as a drop in replacement for `window.crypto`.

## Install

1. [Get started with React Native](https://facebook.github.io/react-native/docs/getting-started.html)
2. Install [React Native WebView Javascript Bridge](https://github.com/alinz/react-native-webview-bridge)
   and verify that it is working for your platform.
3. `npm install --save react-native-crypto`


## Quickstart

Render the `CryptoWorker` component so that the worker starts up.
Then get the `crypto` attribute from it and use that as `window.Crypto`

```javascript
import React, { Component } from 'react';
import { View } from 'react-native';

import App from './app';

import CryptoWorker from 'react-native-crypto';

class TopLevelComponent extends Component {
  render() {
    return (
      <View>
        <CryptoWorker ref={(cw) => window.Crypto = cw.crypto} />
        <App />
      </View>
    );
  }
}

AppRegistry.registerComponent('WhateverName', () => TopLevelComponent);
```

Now, in any of your code, you can access `window.Crypto`, just like
if it was native.
Using [this example for symmetric encryption](https://blog.engelke.com/2014/06/22/symmetric-cryptography-in-the-browser-part-1/)
your application should log `This is very sensitive stuff.` if it was
succesful.


```javascript
var keyPromise = window.crypto.subtle.generateKey(
    {name: "AES-CBC", length: 128}, // Algorithm the key will be used with
    true,                           // Can extract key value to binary string
    ["encrypt", "decrypt"]          // Use for these operations
);

var aesKey;   // Global variable for saving
keyPromise.then(function(key) {aesKey = key;});
keyPromise.catch(function(err) {alert("Something went wrong: " + err.message);});

var iv = new Uint8Array(16);
window.crypto.getRandomValues(iv);

var iv = window.crypto.getRandomValues(new Uint8Array(16));

var plainTextString = "This is very sensitive stuff.";

var plainTextBytes = new Uint8Array(plainTextString.length);
for (var i=0; i<plainTextString.length; i++) {
    plainTextBytes[i] = plainTextString.charCodeAt(i);
}

var cipherTextBytes;
var encryptPromise = window.crypto.subtle.encrypt(
    {name: "AES-CBC", iv: iv}, // Random data for security
    aesKey,                    // The key to use
    plainTextBytes             // Data to encrypt
);
encryptPromise.then(function(result) {cipherTextBytes = new Uint8Array(result);});
encryptPromise.catch(function(err) {alert("Problem encrypting: " + err.message);});

var decryptPromise = window.crypto.subtle.decrypt(
    {name: "AES-CBC", iv: iv}, // Same IV as for encryption
    aesKey,                    // The key to use
    cipherTextBytes            // Data to decrypt
);
var decryptedBytes;
decryptPromise.then(function(result) {decryptedBytes = new Uint8Array(result);});
decryptPromise.catch(function(err) {alert("Problem decrypting: " + err.message); });

var decryptedString = "";
for (var i=0; i<decryptedBytes.byteLength; i++) {
    decryptedString += String.fromCharCode(decryptedBytes[i]);
}

console.log(decryptedString)
```


## Caveats

### `getRandomValues`

Since this uses an asynchronous bridge to execute the crypto logic it
can't quite execute `crypto.getRandomValues` correctly, because that method
returns a value synchronously. It is simply *impossible* (as far as I know,
please let me know if there any ways to get around this) to wait for the
bridge to respond asynchronously before returning a value.

Instead, we return you a promise that resolves to a `TypedArray`.
We also accept these promises on all `crypto.subtle` methods that takes in
`TypedArray`s, to make it transperent and will automatically wait for
them to resolve before asking the webview execute the method.

### `CryptoKey`
Since [JavaScriptCore](https://facebook.github.io/react-native/docs/javascript-environment.html#javascript-runtime)
does not support `window.Crypto`, it also doesn't have a `CryptoKey` interface.
So instead of returning an actual `CryptoKey` from
[`subtle.generateKey()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey)
we instead return an object that confirms to the `CryptoKey` interface and has
a `_jwk` property that has the value of the key exported as `jwk`. This allows
you to treat the `CryptoKey` as you would normally, and whenever you need to use
it in some `subtle` method, we will automatically convert it back to a real
`CryptoKey` from the `_jwk` string and the metadata.



## Details

We communicate over the bridge asynchronously in JSON.

We send:

```
    {
      id: <id>,
      method: getRandomValues | subtle.<method name>,
      args: [<serialized arg>]
    }
```

And get back

```
    {
      id: <id>,
      value: <serialized return value>
    }
```

or
```
    {
      id: <id>,
      reason: <serialized rejected reason>,
    }
```

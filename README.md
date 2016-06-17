# react-native-crypto

This brings `window.Crypto` to your React Native application. It does this
by communicating with a hidden WebView, which performs the actual
computation.

## Install

1. Get started with React Native
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
        <CryptoWorker ref={(cw) => window.Crypto = cw.crypto}/>
        <App>
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

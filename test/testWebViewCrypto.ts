require("babel-polyfill");
import * as test from "tape";
import WebViewCrypto from "../src/WebViewCrypto";
import {crypto} from "./mockWebViewBridge";
require("imports?WebViewBridgeModule=../test/mockWebViewBridge,WebViewBridge=>WebViewBridgeModule.default!../dist/inject.js");

test("Methods exist", function (t) {
  t.equal(typeof crypto.getRandomValues, "function");
  t.equal(typeof crypto.subtle.encrypt, "function");
  t.end();
});

test("getRandomValues returns the original array", function (t) {
  const array = new Uint8Array(16);
  t.equal(crypto.getRandomValues(array), array);
  t.end();
});

test("getRandomValues eventually updates the array", function (t) {
  const array = new Uint8Array(16);
  t.plan(2);
  t.equal(array[0], 0);
  const updatedArray = crypto.getRandomValues(array);
  updatedArray._promise.then((_) => {
    t.notEqual(array[0], 0);
  });
});

test("getRandomValues can re updated", async function (t) {
  const updatedArray = crypto.getRandomValues(new Uint8Array(16));
  await updatedArray._promise;
  const origFirst = updatedArray[0];

  crypto.getRandomValues(updatedArray);
  await updatedArray._promise;
  t.notEqual(updatedArray[0], origFirst);
  t.end();
});


test("example from https://blog.engelke.com/2014/06/22/symmetric-cryptography-in-the-browser-part-1/ should work", async (t) => {
  const aesKey = await crypto.subtle.generateKey(
      ({name: "AES-CBC", length: 128} as Algorithm), // Algorithm the key will be used with
      true,                           // Can extract key value to binary string
      ["encrypt", "decrypt"]          // Use for these operations
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const plainTextString = "This is very sensitive stuff.";

  const plainTextBytes = new Uint8Array(plainTextString.length);
  for (let i = 0; i < plainTextString.length; i++) {
      plainTextBytes[i] = plainTextString.charCodeAt(i);
  }

  const cipherTextBytes = await crypto.subtle.encrypt(
      ({name: "AES-CBC", iv: iv} as Algorithm), // Random data for security
      aesKey,                    // The key to use
      plainTextBytes             // Data to encrypt
  );

  const decryptedBytes = new Uint8Array(
      await crypto.subtle.decrypt(
        ({name: "AES-CBC", iv: iv} as Algorithm), // Same IV as for encryption
        aesKey,                    // The key to use
        cipherTextBytes            // Data to decrypt
    )
  );

  let decryptedString = "";
  for (let i = 0; i < decryptedBytes.byteLength; i++) {
      decryptedString += String.fromCharCode(decryptedBytes[i]);
  }
  t.equal(decryptedString, "This is very sensitive stuff.");
  t.end();
});

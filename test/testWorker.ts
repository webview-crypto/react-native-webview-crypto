import * as test from "tape";
import MockWebViewBridge, {crypto} from "./mockWebViewBridge";

(window as any).WebViewBridge = MockWebViewBridge;
require("../inject/index.ts");
MockWebViewBridge.send("We are ready!");

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

function sleep() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 100);
  });
}

test("getRandomValues eventually updates the array", async function (t) {
  const array = new Uint8Array(16);
  t.equal(array[0], 0);
  const updatedArray = crypto.getRandomValues(array);
  await sleep();
  t.notEqual(array[0], 0);
  t.end();
});

test("getRandomValues can re updated", async function (t) {
  const updatedArray = crypto.getRandomValues(new Uint8Array(16));
  await sleep();
  const origFirst = updatedArray[0];

  crypto.getRandomValues(updatedArray);
  await sleep();
  t.notEqual(updatedArray[0], origFirst);
  t.end();
});

// below copied from https://github.com/diafygi/webcrypto-examples

test("RSA-OAEP - generateKey", async (t) => {
  const key = await crypto.subtle.generateKey(
    ({
      name: "RSA-OAEP",
      modulusLength: 2048, // can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: {name: "SHA-1"}, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    } as Algorithm),
    true, //  whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"] //  can be any combination of "sign" and "verify"
  );
  t.true(key);
  t.true(key.publicKey);
  t.true(key.privateKey);
  t.end();
});

test("RSA-OAEP - exportKey", async (t) => {
  const key = await crypto.subtle.generateKey(
    ({
      name: "RSA-OAEP",
      modulusLength: 2048, // can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: {name: "SHA-1"}, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    } as Algorithm),
    true, //  whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"] //  can be any combination of "sign" and "verify"
  );
  const keydata = await crypto.subtle.exportKey(
    "jwk", // can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    key.publicKey // can be a publicKey or privateKey, as long as extractable was true
  );
  t.true(keydata);
  t.end();
});

test("RSA-OAEP - encrypt", async (t) => {
    const key = await crypto.subtle.generateKey(
    ({
      name: "RSA-OAEP",
      modulusLength: 2048, // can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: {name: "SHA-1"}, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    } as Algorithm),
    true, //  whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"] //  can be any combination of "sign" and "verify"
  );
  const encrypted = await crypto.subtle.encrypt(
    "RSA-OAEP",
    key.publicKey, // from generateKey or importKey above
    ((new Uint8Array(16)).buffer as any) // ArrayBuffer of data you want to sign
  );
  t.true(new Uint8Array(encrypted));
  t.end();
});

test("RSA-OAEP - decrypt", async (t) => {
  const key = await crypto.subtle.generateKey(
    ({
      name: "RSA-OAEP",
      modulusLength: 2048, // can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: {name: "SHA-1"}, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    } as Algorithm),
    true, //  whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"] //  can be any combination of "sign" and "verify"
  );
  const encrypted = await crypto.subtle.encrypt(
    "RSA-OAEP",
    key.publicKey, // from generateKey or importKey above
    ((new Uint8Array(16)).buffer as any) // ArrayBuffer of data you want to sign
  );
  const decrypted = await crypto.subtle.decrypt(
    "RSA-OAEP",
    key.privateKey, // from generateKey or importKey above
    encrypted // ArrayBuffer of data you want to sign
  );
  t.true(new Uint8Array(decrypted));
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

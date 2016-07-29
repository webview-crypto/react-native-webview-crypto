import * as React from "react";
import {parse, stringify, ArrayBufferViewWithPromise} from "./serializeBinary";

const SUBTLE_METHODS = [
  "encrypt",
  "decrypt",
  "sign",
  "verify",
  "digest",
  "generateKey",
  "deriveKey",
  "deriveBits",
  "importKey",
  "exportKey",
  "wrapKey",
  "unwrapKey"
];

/*
Worker provides a `crypto` attribute that proxies method calls
to the webview.

It sends strings to the webview in the format:

    {
      id: <id>,
      method: getRandomValues | subtle.<method name>,
      args: [<serialized arg>]
    }

When the webview succeeds in completeing that method, it gets backs:

    {
      id: <id>,
      value: <serialized return value>
    }

And when it fails:

    {
      id: <id>,
      reason: <serialized rejected reason>,
    }

*/
export default class Worker {
  // hold a queue of messages to send, in case someone calls crypto
  // before the webview is initialized
  private toSend: string[] = [];
  private readyToSend = false;

  // Holds the `resolve` and `reject` function for all the promises
  // we are working on
  private messages: {
    [id: string]: {
      resolve: (value: any ) => void
      reject: (reason: any) => void
    }
  } = {};

  // sendToBridge should take a string and send that message to the bridge
  constructor(private sendToBridge: (message: string) => void, private debug = false) {}

  get crypto(): Crypto {
    const callMethod = this.callMethod;
    return {
      subtle: this.subtle,
      getRandomValues: this.getRandomValues.bind(this)
    };
  }

  private get subtle(): SubtleCrypto {
    const s = {};
    for (let m of SUBTLE_METHODS) {
      s[m] = (...args) => {
        return this.callMethod(`subtle.${m}`, args, true);
      };
    }
    return s as SubtleCrypto;
  }

  private getRandomValues (array: ArrayBufferViewWithPromise): ArrayBufferViewWithPromise {
    array._promise = this.callMethod("getRandomValues", [array], false);
    array._promise.then((updatedArray: ArrayBufferView) => {
      (array as any).set(updatedArray);
    });
    return array;
  }

  onBridgeMessage (message): void {

    // first message just tells us the webview is ready
    if (!this.readyToSend) {
      this.readyToSend = true;
      for (let m of this.toSend) {
        this.sendToBridge(m);
      }
      return;
    }
    parse(message).then(({id, value, reason}) => {
      if (this.debug) {
        console.log("[react-native-webview-crypto] Received message", {
          id,
          value,
          reason
        });
      };
      if (!id) {
        console.warn("react-native-webview-crypto: no ID passed back from message:", reason);
        return;
      }
      const {resolve, reject} = this.messages[id];
      if (value) {
        resolve(value);
      } else {
        reject(reason);
      }
      delete this.messages[id];
    }).catch((reason) => {
      console.warn("react-native-webview-crypto: error in `parse` of message:", message, "reason:", reason);
    });
  }


  private callMethod (method: string, args: any[], waitForArrayBufferView: boolean): Promise<any> {
    const id = Worker.uuid();
    // store this promise, so we can resolve it when we get a message
    // back from the web view
    const promise = new Promise((resolve, reject) => {
      this.messages[id] = {resolve, reject};
    });
    const payloadObject = {method, id, args};
    if (this.debug) {
      console.log("[react-native-webview-crypto] Sending message", {
        method,
        args,
        payloadObject
      });
    };
    stringify(payloadObject, waitForArrayBufferView)
      .then((message) => {
        if (this.readyToSend) {
          this.sendToBridge(message);
        } else {
          this.toSend.push(message);
        }
      })
      .catch((reason) => {
        this.messages[id].reject({
          message: "exception in waiting for array buffer views to resolve",
          reason
        });
        delete this.messages[id];
      });
    return promise;
  }

  // http://stackoverflow.com/a/105074/907060
  private static uuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}-${s4()}-${s4()}-${s4()}-${s4()}-${s4()}-${s4()}-${s4()}`;
  }
}

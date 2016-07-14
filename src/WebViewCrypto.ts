import * as React from "react";
import { UUID } from "angular2-uuid";
import {parse, stringify, ArrayBufferViewWithPromise} from "./serializeBinary";

export default class WebViewCrypto implements Crypto {
  subtle: SubtleCrypto;
  private messages: {
    [id: string]: {
      resolve: (value: any ) => void
      reject: (reason: any) => void
    }
  } = {};
  constructor(private sendToBridge: (message: string) => void) {
    let _this = this;
    this.subtle =  new Proxy({}, {
      get(target, propKey, receiver) {
        return (...args) => {
          return _this.callMethod(`subtle.${propKey}`, args, true);
        };
      }
    }) as SubtleCrypto;

  }

  getRandomValues (array: ArrayBufferViewWithPromise): ArrayBufferViewWithPromise {
    array._promise = this.callMethod("getRandomValues", [array], false);
    array._promise.then((updatedArray: ArrayBufferView) => {
      (array as any).set(updatedArray);
    });
    return array;
  }

  async _onBridgeMessage (message) {
    const {id, value, reason} = await parse(message);
    // console.log("GETTING", message,  {id, value, reason});

    const {resolve, reject} = this.messages[id];
    if (value) {
      resolve(value);
    } else {
      reject(reason);
    }
    delete this.messages[id];
  }

  private callMethod (method: string, args: any[], waitForArrayBufferView: boolean): Promise<any> {
    const id = UUID.UUID();
    // store this promise, so we can resolve it when we get a message
    // back from the web view
    const promise = new Promise((resolve, reject) => {
      (resolve as any).hi = 1;
      this.messages[id] = {resolve, reject};
    });
    const payloadObject = {method, id, args};
    stringify(payloadObject, waitForArrayBufferView)
      // .then((message) => {
      //   console.log("SENDING", payloadObject, message);
      //   return message;
      // })
      .then(this.sendToBridge)
      .catch((reason) => {
        this.messages[id].reject({
          message: "exception in waiting for array buffer views to resolve",
          reason
        });
        delete this.messages[id];
      });

    return promise;
  }
}

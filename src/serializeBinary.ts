import {Serializer, toObjects, fromObjects} from "./asyncSerialize";

declare var require: any;
const clone = require("lodash/clone");

declare const WebViewBridge: any;

export async function parse(text: string): Promise<any> {
  // need decodeURIComponent so binary strings are transfered properly
  const deocodedText = decodeURIComponent(text);
  const objects = JSON.parse(deocodedText);
  return await fromObjects(serializers(true), objects);
}
export async function stringify(value: any, waitForArrayBufferView = true): Promise<string> {
  const serialized = await toObjects(serializers(waitForArrayBufferView), value);
  // need encodeURIComponent so binary strings are transfered properly
  const message = JSON.stringify(serialized);
  return encodeURIComponent(message);
}


function serializers(waitForArrayBufferView: boolean) {
  return [
    ArrayBufferSerializer,
    ArrayBufferViewSerializer(waitForArrayBufferView),
    CryptoKeySerializer
  ];
}


const ArrayBufferSerializer: Serializer<ArrayBuffer, string> = {
  id: "ArrayBuffer",
  isType: (o: any) => o instanceof ArrayBuffer,

  // from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
  // modified to use Int8Array so that we can hold odd number of bytes
  toObject: async (ab: ArrayBuffer) => {
    return String.fromCharCode.apply(null, new Int8Array(ab));
  },
  fromObject: async (data: string) => {
    const buf = new ArrayBuffer(data.length);
    const bufView = new Int8Array(buf);
    for (let i = 0, strLen = data.length; i < strLen; i++) {
      bufView[i] = data.charCodeAt(i);
    }
    return buf;
  }
};

interface ArrayBufferViewSerialized {
  name: string;
  buffer: ArrayBuffer;
}

export interface ArrayBufferViewWithPromise extends ArrayBufferView {
  _promise?: Promise<ArrayBufferView>;
}
function isArrayBufferViewWithPromise(obj: any): obj is ArrayBufferViewWithPromise {
    return obj.hasOwnProperty("_promise");
}

// Normally we could just do `abv.constructor.name`, but in
// JavaScriptCore, this wont work for some weird reason.
// list from https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
function arrayBufferViewName(abv: ArrayBufferView): string {
  if (abv instanceof Int8Array) {
    return "Int8Array";
  }
  if (abv instanceof Uint8Array) {
    return "Uint8Array";
  }
  if (abv instanceof Uint8ClampedArray) {
    return "Uint8ClampedArray";
  }
  if (abv instanceof Int16Array) {
    return "Int16Array";
  }
  if (abv instanceof Uint16Array) {
    return "Uint16Array";
  }
  if (abv instanceof Int32Array) {
    return "Int32Array";
  }
  if (abv instanceof Uint32Array) {
    return "Uint32Array";
  }
  if (abv instanceof Float32Array) {
    return "Float32Array";
  }
  if (abv instanceof Float64Array) {
    return "Float64Array";
  }
  if (abv instanceof DataView) {
    return "DataView";
  }
}

function ArrayBufferViewSerializer(waitForPromise: boolean): Serializer<ArrayBufferView, ArrayBufferViewSerialized> {
  return {
    id: "ArrayBufferView",
    isType: ArrayBuffer.isView,
    toObject: async (abv: ArrayBufferView) => {
      if (waitForPromise) {
        // wait for promise to resolve if the abv was returned from getRandomValues
        if (isArrayBufferViewWithPromise(abv)) {
          await abv._promise;
        }
      }
      return {
        name: arrayBufferViewName(abv),
        buffer: abv.buffer
      };
    },
    fromObject: async (abvs: ArrayBufferViewSerialized) => {
      return eval(`new ${abvs.name}(abvs.buffer)`);
    }
  };
}

interface CryptoKeyWithData extends CryptoKey {
  _jwk: string;
}

interface CryptoKeySerialized extends CryptoKeyWithData {
  serialized: boolean;
}

const CryptoKeySerializer: Serializer<CryptoKeyWithData | CryptoKey, CryptoKeySerialized> = {
  id: "CryptoKey",
  isType: (o: any) => {
    const localStr = o.toLocaleString();
    // can't use CryptoKey or constructor on WebView iOS
    const isCryptoKey = localStr === "[object CryptoKey]" || localStr === "[object Key]" || (o.constructor && o.constructor.name === "CryptoKey");
    const isCryptoKeyWithData = o._jwk && !o.serialized;
    return isCryptoKey || isCryptoKeyWithData;
  },
  toObject: async (ck) => {
    // if we have no crypto, then just export the cryptokey as is,
    // should still be serialized
    if ((window.crypto as any).fake) {
      const newCk = clone(ck) as CryptoKeySerialized;
      newCk.serialized = true;
      return newCk;
    }
    const jwk = await window.crypto.subtle.exportKey("jwk", ck);
    return {
      _jwk: (jwk as any as string),
      serialized: true,
      algorithm: ck.algorithm,
      extractable: ck.extractable,
      usages: ck.usages,
      type: ck.type
    };
  },
  fromObject: async (cks: CryptoKeySerialized) => {
    // if we don't have access to to a real crypto implementation, just return
    // the serialized crypto key
    if ((window.crypto as any).fake) {
      const newCks = clone(cks) as CryptoKeySerialized;
      delete newCks.serialized;
      return newCks;
    }
    return await window.crypto.subtle.importKey(
      "jwk",
      (cks._jwk as any), // for some reason TS wont let me put a string here
      (cks.algorithm as any) ,
      cks.extractable,
      cks.usages
    );
  }
};

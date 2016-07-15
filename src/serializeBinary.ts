import {Serializer, toObjects, fromObjects} from "./asyncSerialize";

export async function parse(text: string): Promise<any> {
  // console.log("PARSE", text);
  const objects = JSON.parse(text);
  return await fromObjects(serializers(true), objects);
}
export async function stringify(value: any, waitForArrayBufferView = true): Promise<string> {
  // console.log("Waiting on toObjects", value);
  const serialized = await toObjects(serializers(waitForArrayBufferView), value);
  // console.log("Done; stringify-ing", serialized);
  return JSON.stringify(serialized);
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
  isType: (o: any) => o.constructor.name === "ArrayBuffer",

  // from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
  // modified to use Int8Array so that we can hold odd number of bytes
  toObject: async (ab: ArrayBuffer) => String.fromCharCode.apply(null, new Int8Array(ab)),
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
        name: abv.constructor.name,
        buffer: abv.buffer
      };
    },
    fromObject: async (abvs: ArrayBufferViewSerialized) => {
      return new (window[abvs.name])(abvs.buffer);
    }
  };
}

interface CryptoKeyWithData extends CryptoKey {
  _jwk: string;
}

function isCryptoKeyWithData(obj: any): obj is CryptoKeyWithData {
    return obj.hasOwnProperty("_jwk");
}

const CryptoKeySerializer: Serializer<CryptoKey, CryptoKeyWithData> = {
  id: "CryptoKey",
  isType: (o: any) => o.constructor.name  === "CryptoKey",
  toObject: async (ck: CryptoKey) => {
    // console.log("Waiting on exportKey", ck);
    const jwk = await window.crypto.subtle.exportKey("jwk", ck);
    // console.log("Done waiting on exportKey", jwk);
    return {
      _jwk: (jwk as any as string),
      algorithm: ck.algorithm,
      extractable: ck.extractable,
      usages: ck.usages,
      type: ck.type
    } as CryptoKeyWithData;
  },
  fromObject: async (ckwd): Promise<CryptoKey> => {
    // we are on a system that sypports the real window.crypto
    if (CryptoKey) {
      return await window.crypto.subtle.importKey(
        "jwk",
        (ckwd._jwk as any), // for some reason TS wont let me put a string here
        (ckwd.algorithm as any) ,
        ckwd.extractable,
        ckwd.usages
      );
    }
    return ckwd;
  }
};

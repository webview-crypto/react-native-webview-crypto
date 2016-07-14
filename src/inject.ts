import {parse, stringify} from "./serializeBinary";
import * as serializeError from "serialize-error";

declare const WebViewBridge: {
  send: (message: string) => void,
  onMessage: (message: string) => void
};

(function () {
  WebViewBridge.onMessage = onMessage;
}());

async function onMessage (message) {
  const {id, method, args} = await parse(message);
  // console.log("INJECT GETTING", message, {id, method, args} );

  let value;

  try {
    if (method === "getRandomValues") {
      value = window.crypto.getRandomValues(args[0]);
    } else {
      const methodName = method.split(".")[1];
      // console.log(`Waiting on ${methodName}`);
      value = await window.crypto.subtle[methodName].apply(window.crypto.subtle, args);
    }
  } catch (e) {
    // console.log("error");
    await send({id, reason: (serializeError as any)(e)});
    return;
  }
  // console.log("done");
  await send({id, value});
}

async function send(data: any) {
  // console.log("waiting on stringify", data);
  let message: string;
  try {
    message = await stringify(data);
  } catch (e) {
    // console.log("react-native-crypto: Error when stringify-ing data", e);
    return;
  }
  // console.log("INJECT SENDING", data, message);
  WebViewBridge.send(message);
}

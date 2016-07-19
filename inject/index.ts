import {parse, stringify} from "../src/serializeBinary";
import {subtle} from "../src/compat";

declare var require: any;
const serializeError: any = require("serialize-error");

declare const WebViewBridge: {
  send: (message: string) => void,
  onMessage: (message: string) => void
};

(function () {
  if (WebViewBridge) {
    WebViewBridge.onMessage = onMessage;
    WebViewBridge.send("Ready!");
  }
}());

async function onMessage (message) {
  let id, method, args;
  try {
    ({id, method, args} = await parse(message));
  } catch (e) {
    await send({
      reason: `Couldn't parse data: ${e}`
    });
    return;
  }
  let value;

  try {
    if (method === "getRandomValues") {
      value = window.crypto.getRandomValues(args[0]);

    } else {
      const methodName = method.split(".")[1];
      value = await subtle()[methodName].apply(subtle(), args);
    }
  } catch (e) {
    await send({id, reason: (serializeError as any)(e)});
    return;
  }
  await send({id, value});
}

async function send(data: any) {
  let message: string;
  try {
    message = await stringify(data);
  } catch (e) {
    const newData = {
      id: data.id,
      reason: `stringify error ${e}`
    };
    WebViewBridge.send(JSON.stringify(newData));
    return;
  }
  WebViewBridge.send(message);
}

import {Dictionary} from "typescript-collections";
import * as React from "react";
import {StyleSheet, View} from "react-native";
import WebViewBridge from "react-native-webview-bridge";

/* We communicate asynchronously over the bridge through a JSON api.

   We send:
    {
      id: <id>,
      method: getRandomValues | subtle.<method name>,
      args: [<serialized arg>]
    }

  Possible return message:
    {
      id: <id>,
      value: <serialized return value>
    }

    {
      id: <id>,
      exception: <serialized exception raised>,
    }
 */
const injectScript = `
  (function () {

        WebViewBridge.send(window.crypto.toString());
                  }());
`;

        // WebViewBridge.onMessage = function (message) {
        //   if (message === "hello from react-native") {
        //     WebViewBridge.send("got the message inside webview");
        //   }
        // };

function serialize(x: any): string {

}

function parse(s: string): any {

}

const target = {};
const handler = {
    get(target, propKey, receiver) {
        console.log('get ' + propKey);
        return 123;
    }
};
const proxy = new Proxy(target, handler);

class Worker {

}

class WebViewCrypto implements Crypto {
  subtle: SubtleCrypto;

  constructor(private webviewbridge: WebViewBridge) {
    this.subtle = new Proxy({}, {
      get(target, propKey, receiver) {
        console.log('get ' + propKey);
        return 123;
      }
    }) as SubtleCrypto;
  }


  onBridgeMessage (message) {
    this.webviewbridge.sendToBridge("hello from react-native");
  }

  getRandomValues (typedArray) {
    return typedArray;
  }
}

export default class CryptoWorker extends React.Component<any, any> {
  crypto: WebViewCrypto;
  render () {
    return (
      <View style = {styles.hidden } >
        <WebViewBridge
          ref={(c) => {this.crypto = new WebViewCrypto(c); }}
          onBridgeMessage = {this.crypto.onBridgeMessage}
          injectedJavaScript = {injectScript}
          javaScriptEnabled
          source = { {uri: "about:blank"} } />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hidden: {
    height: 0,
    opacity: 0
  }
});

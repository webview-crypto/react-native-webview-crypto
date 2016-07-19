import * as React from "react";
import {StyleSheet, View} from "react-native";
const WebViewBridge = require("react-native-webview-bridge");

import Worker from "./Worker";
import injectString from "../inject/dist/string";
import {stringify} from "./serializeBinary";

export default class PolyfillCrypto extends React.Component<{}, {}> {
  shouldComponentUpdate (nextProps, nextState) {
    return false;
  }

  render() {
    let worker: Worker;
    return (
      <View style={styles.hidden} >
        <WebViewBridge
          ref={
            (c) => {
              if (c && !worker)  {
                worker = new Worker(c.sendToBridge);

                if (window.crypto) { // we are in chrome debugger
                  // this means overridng the crypto object itself won't
                  // work, so we have to override all of it's methods
                  window.crypto.getRandomValues = worker.crypto.getRandomValues;
                  for (let name in worker.crypto.subtle) {
                    window.crypto.subtle[name] = worker.crypto.subtle[name];
                  }
                } else {
                  (window as any).crypto = worker.crypto;
                }
                (window.crypto as any).fake = true;
              }
            }
          }
          onBridgeMessage={
            // can't refer to this.state.onBridgeMessage directly
            // because it is not defined when this component is first
            // started, only set in `ref`
            (message: string) => {
              worker.onBridgeMessage(message);
            }
          }
          injectedJavaScript={ injectString }
          onError = {
            (error) => {
              console.warn("react-native-webview-crypto: Error creating webview: ", error);
            }
          }
          javaScriptEnabled
          source={ {uri: "about:blank"} } />
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

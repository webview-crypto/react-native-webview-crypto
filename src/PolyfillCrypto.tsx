import * as React from "react";
import {StyleSheet, View} from "react-native";
const WebViewBridge = require("react-native-webview-bridge");

import Worker from "./Worker";
import injectString from "../inject/dist/string";

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
              console.warn("new render", c);
              if (c && !worker)  {
                worker = new Worker(c.sendToBridge);
                (window as any).crypto = worker.crypto;
              }
            }
          }
          onBridgeMessage={
            // can't refer to this.state.onBridgeMessage directly
            // because it is not defined when this component is first
            // started, only set in `ref`
            (message: string) => {
              console.warn("Got bridge message", message);
              worker.onBridgeMessage(message);
            }
          }
          injectedJavaScript={ injectString }
          onError = {
            (error) => {
              console.warn("webview error", error);
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

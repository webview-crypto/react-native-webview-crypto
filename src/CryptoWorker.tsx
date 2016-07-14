import * as React from "react";
import {StyleSheet, View} from "react-native";
import WebViewBridge from "react-native-webview-bridge";
import WebViewCrypto from "./WebViewCrypto";


const inject = require("!raw!../dist/inject.js");

export default class CryptoWorker extends React.Component<{}, {}> {
  crypto: WebViewCrypto;
  render () {
    return (
      <View style = {styles.hidden } >
        <WebViewBridge
          ref = {(c) => {
            this.crypto = new WebViewCrypto(c.sendToBridge);
          }}
          onBridgeMessage = {this.crypto._onBridgeMessage}
          injectedJavaScript = {inject}
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

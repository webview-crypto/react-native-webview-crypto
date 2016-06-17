"use strict";
const React = require("react");
const react_native_1 = require("react-native");
const react_native_webview_bridge_1 = require("react-native-webview-bridge");
const injectScript = `
  (function () {

        WebViewBridge.send(window.crypto.toString());
                  }());
`;
function serialize(x) {
}
function parse(s) {
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
class WebViewCrypto {
    constructor(webviewbridge) {
        this.webviewbridge = webviewbridge;
        this.subtle = new Proxy({}, {
            get(target, propKey, receiver) {
                console.log('get ' + propKey);
                return 123;
            }
        });
    }
    onBridgeMessage(message) {
        this.webviewbridge.sendToBridge("hello from react-native");
    }
    getRandomValues(typedArray) {
        return typedArray;
    }
}
class CryptoWorker extends React.Component {
    render() {
        return (React.createElement(react_native_1.View, {style: styles.hidden}, 
            React.createElement(react_native_webview_bridge_1.default, {ref: (c) => { this.crypto = new WebViewCrypto(c); }, onBridgeMessage: this.crypto.onBridgeMessage, injectedJavaScript: injectScript, javaScriptEnabled: true, source: { uri: "about:blank" }})
        ));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CryptoWorker;
const styles = react_native_1.StyleSheet.create({
    hidden: {
        height: 0,
        opacity: 0
    }
});

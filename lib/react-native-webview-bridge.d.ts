import { WebView, WebViewProperties, ComponentClass } from "react-native";
import * as React from "react";

declare interface WebViewBridgeProperties extends  WebViewProperties {
  onBridgeMessage: (message: string) => void;
}
export default class WebViewBridge extends React.Component<WebViewBridgeProperties, any> {
  sendToBridge: (message: string) => void;
}

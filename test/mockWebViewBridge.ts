import WebViewCrypto from "../src/WebViewCrypto";

const mockWebViewBridge: {
  // used by WebViewCrypto to send to the brridge
  sendToBridge?: (message: string) => void;

  // Set in `inject.ts`, to get the messages from  `sendToBridge`
  onMessage?: (message: string) => void;

  // called in `inject.ts` to send to the crypto
  send?: (message: string) => void;
} =  {};

mockWebViewBridge.sendToBridge = (message: string) => {
  mockWebViewBridge.onMessage(message);
};
export default mockWebViewBridge;

export const crypto = new WebViewCrypto(mockWebViewBridge.sendToBridge);
mockWebViewBridge.send = (message: string) => {
  crypto._onBridgeMessage(message);
};

import Worker from "../src/Worker";

const mockWebViewBridge: {
  // used by WebViewCrypto to send to the bridge
  sendToBridge?: (message: string) => void;

  // Set in `inject/index.ts`, to get the messages from  `sendToBridge`
  onMessage?: (message: string) => void;

  // called in `inject/index.ts` to send to the crypto
  send?: (message: string) => void;
} =  {};

mockWebViewBridge.sendToBridge = (message: string) => {
  mockWebViewBridge.onMessage(message);
};
export default mockWebViewBridge;
const worker = new Worker(mockWebViewBridge.sendToBridge);
export const crypto = worker.crypto;
mockWebViewBridge.send = (message: string) => {
  worker.onBridgeMessage(message);
};

const React = require("react");
const { StyleSheet, View } = require("react-native");
const { WebView } = require("react-native-webview");
const { MainWorker, webViewWorkerString } = require("webview-crypto");

const styles = StyleSheet.create({
  hide: {
    position: "absolute",

    width: 0,
    height: 0,

    flexGrow: 0,
    flexShrink: 1
  }
});

const internalLibrary = `
(function () {
  function postMessage (message) {
    if (window.ReactNativeWebView.postMessage === undefined) {
      setTimeout(postMessage, 200, message)
    } else {
      window.ReactNativeWebView.postMessage(message)
    }
  }
  var wvw = new WebViewWorker(postMessage)
  // for android
  window.document.addEventListener('message', function (e) {wvw.onMainMessage(e.data);})
  // for ios
  window.addEventListener('message', function (e) {wvw.onMainMessage(e.data);})
}())
`;

let resolveWorker;
let workerPromise = new Promise(resolve => {
  resolveWorker = resolve;
});

function sendToWorker(message) {
  workerPromise.then(worker => worker.onWebViewMessage(message));
}

const subtle = {
  fake: true,
  decrypt(...args) {
    return workerPromise.then(worker => worker.crypto.subtle.decrypt(...args));
  },
  deriveBits(...args) {
    return workerPromise.then(worker =>
      worker.crypto.subtle.deriveBits(...args)
    );
  },
  deriveKey(...args) {
    return workerPromise.then(worker =>
      worker.crypto.subtle.deriveKey(...args)
    );
  },
  digest(...args) {
    return workerPromise.then(worker => worker.crypto.subtle.digest(...args));
  },
  encrypt(...args) {
    return workerPromise.then(worker => worker.crypto.subtle.encrypt(...args));
  },
  exportKey(...args) {
    return workerPromise.then(worker =>
      worker.crypto.subtle.exportKey(...args)
    );
  },
  generateKey(...args) {
    return workerPromise.then(worker =>
      worker.crypto.subtle.generateKey(...args)
    );
  },
  importKey(...args) {
    return workerPromise.then(worker =>
      worker.crypto.subtle.importKey(...args)
    );
  },
  sign(...args) {
    return workerPromise.then(worker => worker.crypto.subtle.sign(...args));
  },
  unwrapKey(...args) {
    return workerPromise.then(worker =>
      worker.crypto.subtle.unwrapKey(...args)
    );
  },
  verify(...args) {
    return workerPromise.then(worker => worker.crypto.subtle.verify(...args));
  },
  wrapKey(...args) {
    return workerPromise.then(worker => worker.crypto.subtle.wrapKey(...args));
  }
};

class PolyfillCrypto extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.webViewRef = React.createRef();
    this.state = {
      webViewKey: 0,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.webViewKey !== this.state.webViewKey;
  }

  // reset promise so it can be resolved on next re-mount
  componentWillUnmount() {
    resolveWorker = undefined;
    workerPromise = new Promise((resolve) => {
      resolveWorker = resolve;
    });
  }

  componentDidMount() {
    const webView = this.webViewRef.current;

    resolveWorker(
      new MainWorker(msg => {
        webView.postMessage(msg);
      }, this.props.debug)
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.webViewKey !== this.state.webViewKey) {
      const webView = this.webViewRef.current;
      resolveWorker(
        new MainWorker(
          (msg) => {
            webView.postMessage(msg);
          },
          this.props.debug
        )
      );
    }
  }

  onContentProcessDidTerminate = (event) => {
    const { nativeEvent } = event;
    console.warn("Content process terminated, reloading", nativeEvent);
    resolveWorker = undefined;
    workerPromise = new Promise((resolve) => {
      resolveWorker = resolve;
    });
    this.setState((prevState) => ({ webViewKey: prevState.webViewKey + 1 }));
  };

  render() {
    const code = `((function () {${webViewWorkerString};${internalLibrary}})())`;
    const html = `<html><body><script language='javascript'>${code}</script></body></html>`
    // The uri 'about:blank' doesn't have access to crypto.subtle on android
//     const uri = "file:///android_asset/blank.html";

    // Base64 dance is to work around https://github.com/facebook/react-native/issues/20365
//     const source = Platform.select({
//       android: { source: { uri } },
//       ios: undefined
//     });
    return (
      <View style={styles.hide}>
        <WebView
          key={this.state.webViewKey}
          javaScriptEnabled={true}
          onContentProcessDidTerminate={this.onContentProcessDidTerminate}
          onError={a =>
            console.error(Object.keys(a), a.type, a.nativeEvent.description)
          }
          onMessage={ev => sendToWorker(ev.nativeEvent.data)}
          ref={this.webViewRef}
          originWhitelist={["*"]}
          source={{ html: html, baseUrl: 'https://localhost' }}
        />
      </View>
    );
  }
}

if (typeof global.crypto !== "object") {
  global.crypto = {};
}

//required for webview-crypto serializer fromObject
global.crypto.fake = true;

if (typeof global.crypto.subtle !== "object") {
  global.crypto.subtle = subtle;
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PolyfillCrypto;

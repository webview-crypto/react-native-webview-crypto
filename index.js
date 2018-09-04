require('react-native-get-random-values')

const React = require('react')
const { StyleSheet, View, WebView } = require('react-native')
const { MainWorker, webViewWorkerString } = require('webview-crypto')
const encodeUtf8 = require('encode-utf8')
const encodeBase64 = require('fast-base64-encode')

/**
 * @param {string} input
 */
function base64EncodeString (input) {
  return encodeBase64(new Uint8Array(encodeUtf8(input)))
}

const styles = StyleSheet.create({
  hide: {
    display: 'none',
    position: 'absolute',

    width: 0,
    height: 0,

    flexGrow: 0,
    flexShrink: 1
  }
})

const internalLibrary = `
(function () {
  function postMessage (message) {
    if (window.postMessage.length !== 1) {
      setTimeout(postMessage, 200, message)
    } else {
      window.postMessage(JSON.stringify(message))
    }
  }

  var wvw = new WebViewWorker(postMessage)
  window.document.addEventListener('message', (e) => wvw.onMainMessage(e.data))
}())
`

let resolveWorker
let workerPromise = new Promise(resolve => { resolveWorker = resolve })

function sendToWorker (message) {
  console.warn(message)
  workerPromise.then(worker => worker.onWebViewMessage(message))
}

const subtle = {
  decrypt (...args) { return workerPromise.then(worker => worker.crypto.subtle.decrypt(...args)) },
  deriveKey (...args) { return workerPromise.then(worker => worker.crypto.subtle.deriveKey(...args)) },
  digest (...args) { return workerPromise.then(worker => worker.crypto.subtle.digest(...args)) },
  encrypt (...args) { return workerPromise.then(worker => worker.crypto.subtle.encrypt(...args)) },
  exportKey (...args) { return workerPromise.then(worker => worker.crypto.subtle.exportKey(...args)) },
  generateKey (...args) { return workerPromise.then(worker => worker.crypto.subtle.generateKey(...args)) },
  importKey (...args) { return workerPromise.then(worker => worker.crypto.subtle.importKey(...args)) },
  sign (...args) { return workerPromise.then(worker => worker.crypto.subtle.sign(...args)) },
  unwrapKey (...args) { return workerPromise.then(worker => worker.crypto.subtle.unwrapKey(...args)) },
  verify (...args) { return workerPromise.then(worker => worker.crypto.subtle.verify(...args)) },
  wrapKey (...args) { return workerPromise.then(worker => worker.crypto.subtle.wrapKey(...args)) }
}

class PolyfillCrypto extends React.Component {
  constructor (props) {
    super(props)
    this.webViewRef = React.createRef()
  }

  shouldComponentUpdate () {
    return false
  }

  componentDidMount () {
    const webView = this.webViewRef.current

    console.warn('CREATING MAIN WORKER')

    resolveWorker(new MainWorker((msg) => { console.warn(msg); webView.postMessage(msg) }))
  }

  render () {
    // The uri 'about:blank' doesn't have access to crypto.subtle
    const uri = 'file:///android_asset/blank.html'

    // Base64 dance is to work around https://github.com/facebook/react-native/issues/20365
    const code = `((function () {${webViewWorkerString};${internalLibrary}})())`
    const injectString = `eval(window.atob('${base64EncodeString(code)}'))`

    const webView = React.createElement(WebView, {
      injectedJavaScript: injectString,
      javaScriptEnabled: true,
      mixedContentMode: 'compatibility',
      onError: (a) => console.error(a),
      onMessage: (ev) => sendToWorker(ev.nativeEvent.data),
      ref: this.webViewRef,
      source: { uri }
    })

    return React.createElement(View, { style: styles.hide }, webView)
  }
}

if (typeof global.crypto !== 'object') {
  global.crypto = {}
}

if (typeof global.crypto.subtle !== 'object') {
  global.crypto.subtle = subtle
}

Object.defineProperty(exports, '__esModule', { value: true })
exports.default = PolyfillCrypto

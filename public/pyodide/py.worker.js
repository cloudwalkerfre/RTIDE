/*eslint-disable*/
const wp = {
    pyodideReady: false,
    pyodide: null
}

//comlink@4.2.0
importScripts('../comlink/comlink.js')
Comlink.expose(wp)
console.log('ComLink ready!')

self.languagePluginUrl = './' || 'https://pyodide.cdn.iodide.io/'
importScripts('./pyodide.js')
console.log('Pyodide Loading...')

languagePluginLoader.then(() => {
    // self.pyodide.remotePath = ["./"]
    wp.pyodide = self.pyodide
    wp.pyodideReady = true
})
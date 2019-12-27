import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
// import 'rsuite/dist/styles/rsuite-default.css'

ReactDOM.render(<App />, document.getElementById('root'))
serviceWorker.unregister()
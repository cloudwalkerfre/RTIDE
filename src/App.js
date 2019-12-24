import React from "react"
// import {
//   BrowserRouter as Router,
//   Switch,
//   Route,
//   Link
// } from "react-router-dom"

import MainView from './components/MainView'
import { StoreProvider } from './hooks/useStore'
import creatStore from './stores/rootStore'

const App = _ =>{
  return (
    // <Router>
      <StoreProvider value={ creatStore() }>
        <MainView />
      </StoreProvider>
    // </Router>
  )
}

export default App
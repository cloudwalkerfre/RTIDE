import React from 'react'

const StoreContex = React.createContext()

export const StoreProvider = StoreContex.Provider

export const useStore = () => React.useContext(StoreContex)
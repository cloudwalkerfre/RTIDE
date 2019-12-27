import React from 'react'
import Header from './header/header'
import WorkSpace from './workspace/workspace'
import Footer from './footer/footer'
import Sidebar from './sider/sidebar'
import { useScript } from '../hooks/useScript'
import { useStore } from '../hooks/useStore'

const MainView = () => {
    const store = useStore()
    useScript(
        process.env.PUBLIC_URL + '/browsix/boot/kernel.js',
        store.os.osBoot
    )
    store.py.checkPyReady()

    return (
        <div className='App'>
            <Header />
            <div className='body'>
                <Sidebar />
                <WorkSpace />
            </div>
            <Footer />
        </div>
    )
}

export default MainView
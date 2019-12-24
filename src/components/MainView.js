import React from 'react'
import Header from './header/header'
import WorkSpace from './workspace/workspace'
import Footer from './footer/footer'
import Sidebar from './sider/sidebar'
import { useScript } from '../hooks/useScript'
import { useStore } from '../hooks/useStore'
import { Container } from 'rsuite'

const MainView = () => {
    const store = useStore()
    useScript(
        process.env.PUBLIC_URL + '/browsix/boot/kernel.js',
        store.os.osBoot
    )
    store.py.checkPyReady()

    return (
        <Container className='App'>
            <Header />
            <Container className='body'>
                <Sidebar />
                <WorkSpace />
            </Container>
            <Footer />
        </Container>
    )
}

export default MainView
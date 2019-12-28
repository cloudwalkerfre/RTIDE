import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'
const Tab = observer(({ tab }) => {
    const store = useStore()

    return (
        <div
            className={ tab.isCurrent? 'header-tab-tag-current' : 'header-tab-tag'}
        >
            <div className='header-tab-tag-name' onClick={ () => store.tabs.handleClick(tab) }>
                { tab.name }
            </div>
            <ReactSVG src='icons/close.svg' onClick={() => store.tabs.handleClose(tab)} />
        </div>
    )
})

const Header = observer(() => {
    const store = useStore()

    return (
        <div className='header'>
            <div className='header-name-tag'>{'\u00A0'.repeat(5) + 'EXPLORER'}</div>
            {store.editor.isEditorReady &&
            <div className='header-tabs-container'>
                { store.tabs.tabs.map(tab =>
                    <Tab tab={ tab } key={ Math.random() } />
                )}
            </div>}
        </div>
    )
})

export default Header
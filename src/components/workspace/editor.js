import React, { useRef }from "react";
import Editor, {monaco} from "@monaco-editor/react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'

/*
    facing issue using local server when changing language
*/
monaco
    .config({
        // urls: {
        //     monacoLoader: './monaco/loader.js',
        //     monacoBase: './monaco/'
        //     }
    })
    .init()
    .then(
        monaco => console.log('Monaco Booting...')
    )
    .catch(
        error => console.error('An error occurred during initialization of Monaco: ', error)
    )

const MonoEditor = observer(() => {

    const editorRef = useRef()
    const store = useStore()

    const handleEditorDidMount = (_, _valueGetter) => {
        editorRef.current = _valueGetter
        store.editor.setEditorReady()
        editorRef.current.onDidChangeModelContent(ev => {
            store.editor.setValue(editorRef.current.getValue())
        })
        console.log('Monaco booted!')
    }

    return (
        <div className='editor'>
            <Editor
                theme='dark'
                height={ window.innerHeight - 270 }
                language={ store.editor.language }
                value={ store.editor.value }
                editorDidMount={ handleEditorDidMount }
                // automaticLayout={ true }
            />
        </div>
    )
})

export default MonoEditor
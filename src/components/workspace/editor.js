import React, { useRef, useEffect }from "react";
import Editor, { monaco } from "@monaco-editor/react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'

const MonoEditor = observer(() => {

    const editorRef = useRef()
    // const monoRef = useRef()
    const store = useStore()

    useEffect(() => {
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
                monaco => store.editor.setMonacoInstance(monaco)
            )
            .catch(
                error => console.error('An error occurred during initialization of Monaco: ', error)
            )
    }, [])

    const handleEditorDidMount = (_, _valueGetter) => {
        editorRef.current = _valueGetter
        store.editor.setEditorReady()
        store.editor.setEditorInstance(editorRef.current)
        editorRef.current.onDidChangeModelContent(ev => {
            store.editor.setIsEdited(true)
        })
        console.log('Monaco booted!')
    }

    return (
        <div className='editor'>
            <Editor
                theme='dark'
                height={ store.editor.height }
                editorDidMount={ handleEditorDidMount }
                // automaticLayout={ true }
            />
        </div>
    )
})

export default MonoEditor
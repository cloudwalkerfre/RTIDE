import { types } from "mobx-state-tree"
import pyStore from './pyStore'
import editorStore from './editorStore'
import osStore from './osStore'
import viewStore from './viewStore'
import fileStore from './fileStore'

const rootStore = types
    .model('RootStore',{
        py: pyStore,
        editor: editorStore,
        os: osStore,
        view: viewStore,
        file: fileStore
    })

const creatStore = () => {
    const py = pyStore.create()
    const editor = editorStore.create()
    const os = osStore.create()
    const view = viewStore.create()
    const file = fileStore.create()
    const env = { py, editor, os, view, file }

    return rootStore.create({
        py: py,
        editor: editor,
        os: os,
        view: view,
        file: file
    }, env)
}

export default creatStore
import { types } from "mobx-state-tree"
import pyStore from './pyStore'
import editorStore from './editorStore'
import osStore from './osStore'
import tabStore from './tabStore'
import fileStore from './fileStore'

const rootStore = types
    .model('RootStore',{
        py: pyStore,
        editor: editorStore,
        os: osStore,
        tabs: tabStore,
        file: fileStore
    })

const creatStore = () => {
    const py = pyStore.create()
    const editor = editorStore.create()
    const os = osStore.create()
    const tabs = tabStore.create()
    const file = fileStore.create()
    const env = { py, editor, os, tabs, file }

    return rootStore.create({
        py: py,
        editor: editor,
        os: os,
        tabs: tabs,
        file: file
    }, env)
}

export default creatStore
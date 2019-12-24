import { types } from 'mobx-state-tree'
import { regexFileType } from '../util/util'

const editorStore = types.model('editor', {
        isEditorReady: false,
        height: '90vh',
        language: 'python',
        value: 'import sys\nsys.version'
    }).actions(self => ({
        setEditorReady(){
            self.isEditorReady = true
        },
        setValue(value){
            self.value = value
        },
        newMono(value, path){
            self.value = value
            const type = regexFileType(path)
            if(type){
                self.language = type || 'javascript'
            }
        }
    }))

export default editorStore
import { types, getEnv } from 'mobx-state-tree'
import { regexFileType } from '../util/util'

let EditorInstance

const editorStore = types.model('editor', {
        isEditorReady: false,
        height: '60vh',
        language: '',
        value: '',
        initialValue: '',
        pathName: '',
        isEdited: false
    }).actions(self => ({
        setEditorReady(){
            self.isEditorReady = true
        },
        setValue(newValue){
            if(newValue !== self.initialValue){
                self.isEdited = true
                self.value = newValue
            }
        },
        getValue(){
            return self.value
        },
        getIsEdited(){
            return self.isEdited
        },
        setEditorInstance(ins){
            EditorInstance = ins
        },
        newMono(str, pathName){
            if(self.isEdited){
                const ev = getEnv(self)
                ev.os.exeExitback('echo "' + self.value + '" > ' + self.pathName,
                    () => { console.log(self.pathName + ' saved!') }
                )
            }
            self.value = str || ''
            self.initialValue = str
            self.pathName = pathName
            self.isEdited = false
            self.language = regexFileType(pathName) || 'javascript'
            if(EditorInstance){
                EditorInstance.focus()
            }
        }
    }))

export default editorStore
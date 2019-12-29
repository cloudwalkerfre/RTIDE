import { types, getEnv } from 'mobx-state-tree'
import { regexFileType } from '../util/util'

let EditorInstance

const editorStore = types.model('editor', {
        isEditorReady: false,
        height: '60vh',
        language: '',
        value: '',
        initialValue: '',
        id: '',
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
        setIsEdited(edit){
            self.isEdited = edit
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
        newMono(str, id, cached){
            const ev = getEnv(self)
            ev.tabs.setMonoViewState(self.id, EditorInstance.getModel(), EditorInstance.saveViewState())

            if(self.isEdited){
                ev.os.exeExitback('echo "' + self.value + '" > ' + self.id,
                    () => { console.log(self.id + ' saved!') }
                )
            }
            self.initialValue = str
            self.id = id
            self.isEdited = false
            self.value = str || ''
            self.language = regexFileType(id) || 'javascript'
            if(cached){
                EditorInstance.setModel(cached.model)
                EditorInstance.restoreViewState(cached.state)
            }
            if(EditorInstance){
                EditorInstance.focus()
            }
        }
    }))

export default editorStore
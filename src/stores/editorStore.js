import { types, getEnv } from 'mobx-state-tree'
import { regexFileType } from '../util/util'

const editorStore = types.model('editor', {
        isEditorReady: false,
        height: '90vh',
        language: '',
        value: '',
        initialValue: '',
        pathNname: '',
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
        newMono(str, pathNname){
            if(self.isEdited){
                const ev = getEnv(self)
                ev.os.exeExitback('echo "' + self.value + '" > ' + self.pathNname,
                    () => { console.log(self.pathNname + ' saved!') }
                )
            }
            self.value = str || ''
            self.initialValue = str
            self.pathNname = pathNname
            self.isEdited = false
            self.language = regexFileType(pathNname) || 'javascript'
        }
    }))

export default editorStore
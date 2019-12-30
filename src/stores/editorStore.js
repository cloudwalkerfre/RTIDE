import { types, getEnv, getSnapshot } from 'mobx-state-tree'
import { regexFileType } from '../util/util'

let EditorInstance
let MonacoInstance
//TODO: Add cache size control or model GC
const monoCache = {}

const editorStore = types.model('editor', {
        isEditorReady: false,
        height: '60vh',
        // language: '',
        // value: '',
        initialValue: '',
        id: '',
        isEdited: false
    }).actions(self => ({
        setEditorReady(){
            self.isEditorReady = true
        },
        setIsEdited(edit){
            self.isEdited = edit
        },
        getIsEdited(){
            return self.isEdited
        },
        getCurrentEditorValue(){
            return EditorInstance.getValue()
        },
        getEditorValue(id){
            return monoCache[id].model.getValue()
        },
        setEditorInstance(ins){
            EditorInstance = ins
        },
        setMonacoInstance(ins){
            MonacoInstance = ins
        },
        newMono(str, id){
            const ev = getEnv(self)

            if(self.id !== ''){
                self.setMonoCache(self.id, EditorInstance.getModel(), EditorInstance.saveViewState())
            }
            if(id in monoCache){
                EditorInstance.setModel(monoCache[id].model)
                EditorInstance.restoreViewState(monoCache[id].state)
            }else{
                const newModel = MonacoInstance.editor.createModel(str, regexFileType(id) || 'javascript')
                EditorInstance.setModel(newModel)
                self.setMonoCache(id, newModel, null)
            }
            self.isEdited = false
            self.id = id

            if(EditorInstance){
                EditorInstance.focus()
            }
        },
        getIsEditorEdited(id){
            return monoCache[id].model.getVersionId() !== 1
        },
        setMonoCache(id, model, state){
            if(!(id in monoCache)){
                monoCache[id] = {}
            }
            monoCache[id].model = model
            monoCache[id].state = state
        },
        getMonoCached(id){
            if (id in monoCache){
                return {model: monoCache[id].model, state: monoCache[id].state}
            }else{
                return undefined
            }
        }
    }))

export default editorStore
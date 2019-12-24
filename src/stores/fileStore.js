import { types, getEnv } from "mobx-state-tree"

const fileStore = types
    .model('file',{
        directory: '',
        fileStoreReady: false
    })
    .actions(self => ({
        setDirectory(d){
            self.directory = d
            self.fileStoreReady = true
            // console.log(JSON.stringify(self.directory))
        },
        getDirectory(){
            return self.directory
        },
        isFileStoreReady(){
            return self.fileStoreReady
        },
        monoOpen(path){
            const ev = getEnv(self)
            ev.os.exeCallback('cat '+ path, (string) => ev.editor.newMono(string, path))
        }
    }))

export default fileStore
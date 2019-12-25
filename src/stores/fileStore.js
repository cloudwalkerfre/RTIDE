import { types, getEnv, getRelativePath, resolvePath } from "mobx-state-tree"

/*
    There should be a better name for this, directory is kind of missleading,
    because it could be either a file or folder, but since we use recursion
    all the time, it's the temp selution as for now
*/
const directory = types
    .model('directory', {
        name: types.string,
        path: types.string,
        type: types.string,
        isOpen: false,
        isExpend: true,
        children: types.optional(types.array(types.late(() => directory)), [])
    })

const fileStore = types
    .model('file',{
        directory: types.maybe(directory),
        fileStoreReady: false,
        // currentOpen: '',
        lastOpen: ''
    })
    .actions(self => ({
        setDirectory(tree){
            const treejson = JSON.parse(tree)
            self.directory = directory.create(treejson)
            self.fileStoreReady = true
        },
        getDirectory(){
            return self.directory
        },
        isFileStoreReady(){
            return self.fileStoreReady
        },
        handleClick(file){
            if(file.type === 'file'){
                if(self.lastOpen !== getRelativePath(self.directory, file)){
                    const ev = getEnv(self)
                    ev.os.exeCallback('cat '+ file.path + '/' + file.name, (string) => ev.editor.newMono(string, file.path))
                    file.isOpen = true
                    if(file.lastOpen !== ''){
                        resolvePath(self.directory, self.lastOpen).isOpen = false
                    }
                    self.lastOpen = getRelativePath(self.directory, file)
                }
            }else{
                file.isOpen = !file.isOpen
                file.isExpend = !file.isExpend
                if(file.lastOpen !== ''){
                    resolvePath(self.directory, self.lastOpen).isOpen = false
                }
                self.lastOpen = getRelativePath(self.directory, file)
            }
        }
    }))

export default fileStore
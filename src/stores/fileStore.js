import { types, getEnv, getRelativePath, resolvePath, getSnapshot } from "mobx-state-tree"

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
        isCurrent: false,
        isOpen: false,
        isExpend: false,
        children: types.optional(types.array(types.late(() => directory)), [])
    })

const fileStore = types
    .model('file',{
        directory: types.maybe(directory),
        fileStoreReady: false,
        // currentOpen: '',
        lastClick: '',
        folderExpandCollec: types.array(types.string)
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
            const jsonPath = getRelativePath(self.directory, file)
            if(file.type === 'file'){
                if(self.lastClick !== jsonPath){
                    const ev = getEnv(self)
                    ev.os.exeCallback('cat '+ file.path + '/' + file.name, (string) => ev.editor.newMono(string, file.path))
                    file.isCurrent = true
                    if(file.lastClick !== ''){
                        resolvePath(self.directory, self.lastClick).isCurrent = false
                    }
                    self.lastClick = jsonPath
                    file.isOpen = true
                }
            }else{
                if(self.lastClick !== jsonPath){
                    file.isCurrent = !file.isCurrent
                    if(file.lastClick !== ''){
                        resolvePath(self.directory, self.lastClick).isCurrent = false
                    }
                    self.lastClick = jsonPath
                }
                file.isExpend = !file.isExpend
                if(file.isExpend){
                    self.folderExpandCollec.push(jsonPath)
                }else{
                    const index = self.folderExpandCollec.indexOf(jsonPath)
                    if(index !== -1){
                        self.folderExpandCollec.splice( index, 1 )
                    }
                }
            }
        },
        refresh(){
            const ev = getEnv(self)
            self.fileStoreReady = false
            const tmpExpands = getSnapshot(self.folderExpandCollec)
            const tmpCurrent = self.lastClick
            ev.os.exeCallback('treejson', (tree) => {
                self.setDirectory(tree)
                self.setFolderExpand(tmpExpands)
                self.setDirectoryReady()
                self.setLastClick(tmpCurrent)
            })
        },
        /* TODO */
        mkdir(){
            const dirPathName = 'home/' + 'tmpdir'
            const ev = getEnv(self)
            self.fileStoreReady = false
            ev.os.exeExitback('mkdir ' + dirPathName, self.refresh)
        },
        collapseAll(){
            self.folderExpandCollec.forEach(c => {
                resolvePath(self.directory, c).isExpend = false
            })
            resolvePath(self.directory, self.lastClick).isCurrent = false
        },
        setFolderExpand(expands){
            self.folderExpandCollec = expands
            self.folderExpandCollec.forEach(c => {
                resolvePath(self.directory, c).isExpend = true
            })
        },
        setDirectoryReady(){
            self.isFileStoreReady = true
        },
        setLastClick(last){
            self.lastClick = last
            resolvePath(self.directory, last).isCurrent = true
        }
    }))

export default fileStore
import { types, getEnv, getRelativePath, resolvePath, getSnapshot, getParent, tryResolve } from "mobx-state-tree"

/*
    There should be a better name for this, directory is kind of missleading,
    because it could be either a file or folder, but since we use recursion
    all the time, it's the temp selution as for now

    TODO:
        - better comment
        - handle blur while mkdir
        - handle fresh after file operation made in terminal
            - option 1: set flag, don't do folder expand after terminal operation
            - option 2: hard coding
            fuck me...
        - new file
        - scroll to node after refresh
        - first time writting file folder, what a mess...
        - reorganize when all things settled
*/

let FileViewRef

const directory = types
    .model('directory', {
        name: types.string,
        path: types.string,
        type: types.string,
        isCurrent: false,
        isOpen: false,
        isExpend: false,
        isEdit: false,
        children: types.optional(types.array(types.late(() => directory)), [])
    })

const fileStore = types
    .model('file',{
        directory: types.maybe(directory),
        fileStoreReady: false,
        // currentOpen: '',
        lastClick: '',
        mkdirLastClick: '',
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
            if(file.isEdit){
                return
            }
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
            // console.log(tmpExpands)
            const tmpCurrent = self.lastClick
            ev.os.exeCallback('treejson', (tree) => {
                self.setDirectory(tree)
                self.setFolderExpand(tmpExpands)
                self.setDirectoryReady()
                self.setLastClick(tmpCurrent)
            })
        },
        mkdir1(){
            let PATH
            let PARENT
            const LastClickNode = resolvePath(self.directory, self.lastClick)
            if(self.lastClick !== ''){
                self.mkdirLastClick = self.lastClick
                if(LastClickNode.type === 'file'){
                    PATH = LastClickNode.path
                    PARENT = getParent(resolvePath(self.directory, self.lastClick))
                }else{
                    PATH = LastClickNode.path + '/' + LastClickNode.name
                    PARENT = LastClickNode.children
                    if(!LastClickNode.isExpend){
                        LastClickNode.isExpend = true
                        self.folderExpandCollec.push(self.lastClick)
                    }
                }
            }else{
                self.mkdirLastClick = ''
                PATH = '/'
                PARENT = self.directory.children
                self.directory.isExpend = true
                self.folderExpandCollec.push('')
            }
            const newDir = directory.create({
                    name: 'tmpdir',
                    path: PATH,
                    type: 'dir',
                    isCurrent: true,
                    isOpen: false,
                    isExpend: true,
                    isEdit: true,
                    children: []
                })
                PARENT.push(newDir)
            if(self.lastClick !== ''){
                LastClickNode.isCurrent = false
            }
            const newDirJsonPath = getRelativePath(self.directory, newDir)
            self.lastClick = newDirJsonPath
            self.folderExpandCollec.push(newDirJsonPath)
        },
        /* TODO: handle newDir of the same name */
        mkdir2(e){
            if(e.keyCode === 13 && e.target.value !== ''){
                const tmpDir = e.target.value
                const tmpDirNode = resolvePath(self.directory, self.lastClick)
                const dirPathName = tmpDirNode.path + '/' + tmpDir
                tmpDirNode.isEdit = false

                const ev = getEnv(self)
                self.fileStoreReady = false
                ev.os.exeExitback('mkdir ' + dirPathName, self.refresh)
            }else if(e.keyCode === 27){
                const tmpDirNode = resolvePath(self.directory, self.lastClick)
                const PARENT = getParent(tmpDirNode)
                PARENT.pop()
                self.folderExpandCollec.pop()
                self.lastClick = self.mkdirLastClick
                resolvePath(self.directory, self.lastClick).isCurrent = true
                // self.refresh()
            }
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
        },
        setFileViewRef(ref){
            FileViewRef = ref
        },
        getFileViewRef(){
            return FileViewRef
        }
    }))

export default fileStore
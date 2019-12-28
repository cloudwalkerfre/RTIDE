import { types, getEnv, getRelativePath, resolvePath, getSnapshot, getParent } from "mobx-state-tree"

/*
    There should be a better name for this, directory is kind of missleading,
    because it could be either a file or folder, but since we use recursion
    all the time, it's the temp selution as for now

    TODO:
        - better comment
        - rename path to pwd in directory and browsix/usr/bin/treejson
        - handle fresh after file operation made in terminal
            - option 1: set flag, don't do folder expand after terminal operation
            - option 2: hard coding
            fuck me...
        - scroll to node after refresh
        - error try catch
        - first time writting file folder, what a mess...
        - reorganize when all things settled
        - Notification for illegal dirname input, ex: dirname start with number bring render issue
*/

let FileViewRef
let NewTagInputRef

const directory = types
    .model('directory', {
        name: types.string,
        path: types.string,
        type: types.string,
        isCurrent: false,
        isOpen: false,
        isExpend: false,
        isNameEdit: false,
        children: types.optional(types.array(types.late(() => directory)), [])
    })

const fileStore = types
    .model('file',{
        directory: types.maybe(directory),
        fileStoreReady: false,
        // currentOpen: '',
        lastClick: '',
        tmpLastClick: '',
        folderExpandCollec: types.array(types.string)
    })
    .views(self => ({
        get lastClickNode(){
            return resolvePath(self.directory, self.lastClick)
        }
    }))
    .actions(self => ({
        init(tree){
            const ev = getEnv(self)
            ev.os.exeExitback('mkdir home && touch home/test.py && echo "import sys\nsys.version" > home/test.py', () => {})

            const treejson = JSON.parse(tree)
            treejson.isExpend = true
            const home = {
                name: 'home',
                path: '/',
                type: 'dir',
                children: [],
                isCurrent: false,
                isOpen: false,
                isExpend: true,
                isNameEdit: false
            }
            const testpy = {
                name: 'test.py',
                path: '/home',
                type: 'file',
                isCurrent: true,
                isOpen: true,
                isExpend: false,
                isNameEdit: false
            }
            home.children.push(testpy)
            treejson.children.push(home)

            self.directory = directory.create(treejson)
            self.fileStoreReady = true

            self.directory.children.forEach(c => {
                if(c.name === home.name){
                    self.folderExpandCollec.push(getRelativePath(self.directory, c))
                    self.lastClick = getRelativePath(self.directory, c.children[0])
                }
            })
            ev.tabs.addTab({name: 'test.py', path: '/home'}, 'import sys\nsys.version')
        },
        setDirectory(treejson){
            treejson.isExpend = true
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
            if(file.isNameEdit){
                return
            }
            const jsonPath = getRelativePath(self.directory, file)
            if(file.type === 'file'){
                if(self.lastClick !== jsonPath){
                    const ev = getEnv(self)

                    let catReturn = ''
                    ev.os.exeCallback('cat '+ file.path + '/' + file.name,
                        () => ev.tabs.addTab({name: file.name, path: file.path}, catReturn),
                        (string) => catReturn = string
                    )
                    file.isCurrent = true
                    if(file.lastClick !== ''){
                        self.lastClickNode.isCurrent = false
                    }
                    self.lastClick = jsonPath
                    file.isOpen = true
                }
            }else{
                if(self.lastClick !== jsonPath){
                    file.isCurrent = !file.isCurrent
                    if(file.lastClick !== ''){
                        self.lastClickNode.isCurrent = false
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
            ev.os.exeCallback('treejson',
                () => {},
                (tree) => {
                    self.setDirectory(JSON.parse(tree))
                    self.setFolderExpand(tmpExpands)
                    self.setLastClick(tmpCurrent)
                }
            )
        },
        mkdir1(){
            let PATH
            let PARENT
            if(self.lastClick !== ''){
                self.tmpLastClick = self.lastClick
                if(self.lastClickNode.type === 'file'){
                    PATH = self.lastClickNode.path
                    PARENT = getParent(self.lastClickNode)
                }else{
                    PATH = self.lastClickNode.path + '/' + self.lastClickNode.name
                    PARENT = self.lastClickNode.children
                    if(!self.lastClickNode.isExpend){
                        self.lastClickNode.isExpend = true
                        self.folderExpandCollec.push(self.lastClick)
                    }
                }
            }else{
                self.tmpLastClick = ''
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
                    isNameEdit: true,
                    children: []
                })
                PARENT.push(newDir)
            if(self.lastClick !== ''){
                self.lastClickNode.isCurrent = false
            }
            const newDirJsonPath = getRelativePath(self.directory, newDir)
            self.lastClick = newDirJsonPath
            self.folderExpandCollec.push(newDirJsonPath)
        },
        /* TODO: handle newDir of the same name */
        mkdir2(e){
            if(e.keyCode === 13 && e.target.value !== ''){
                const tmpDir = e.target.value
                /*
                    dirname start with number bring render issue
                    TODO: Notification
                */
                if(tmpDir.match(/^\d|\u0020+|\//g) !== null){
                    self.handleNewTagInputDelete()
                    return
                }
                const dirPathName = self.lastClickNode.path + '/' + tmpDir
                self.lastClickNode.name = tmpDir

                NewTagInputRef.current.removeEventListener('blur', self.handleNewTagInputDelete)
                self.lastClickNode.isNameEdit = false

                const ev = getEnv(self)
                // self.fileStoreReady = false
                // ev.os.exeExitback('mkdir ' + dirPathName, self.refresh)
                ev.os.exeExitback('mkdir ' + dirPathName, () => {})
            }else if(e.keyCode === 27){
                self.handleNewTagInputDelete()
            }
        },
        newFile1(){
            let PATH
            let PARENT
            if(self.lastClick !== ''){
                self.tmpLastClick = self.lastClick
                if(self.lastClickNode.type === 'file'){
                    PATH = self.lastClickNode.path
                    PARENT = getParent(self.lastClickNode)
                }else{
                    PATH = self.lastClickNode.path + '/' + self.lastClickNode.name
                    PARENT = self.lastClickNode.children
                    if(!self.lastClickNode.isExpend){
                        self.lastClickNode.isExpend = true
                        self.folderExpandCollec.push(self.lastClick)
                    }
                }
            }else{
                self.tmpLastClick = ''
                PATH = '/'
                PARENT = self.directory.children
                self.directory.isExpend = true
                self.folderExpandCollec.push('')
            }
            const newFile = directory.create({
                    name: 'tmpfile',
                    path: PATH,
                    type: 'file',
                    isCurrent: true,
                    isOpen: false,
                    isExpend: false,
                    isNameEdit: true
                })
                PARENT.push(newFile)
            if(self.lastClick !== ''){
                self.lastClickNode.isCurrent = false
            }
            const newDirJsonPath = getRelativePath(self.directory, newFile)
            self.lastClick = newDirJsonPath
        },
        newFile2(e){
            if(e.keyCode === 13 && e.target.value !== ''){
                const tmpFile = e.target.value
                /*
                    filename start with number bring render issue
                    TODO: Notification
                */
                if(tmpFile.match(/^\d|\u0020+|\//g) !== null){
                    self.handleNewTagInputDelete()
                    return
                }
                const filePathName = self.lastClickNode.path + '/' + tmpFile
                self.lastClickNode.name = tmpFile

                NewTagInputRef.current.removeEventListener('blur', self.handleNewTagInputDelete)
                self.lastClickNode.isNameEdit = false

                const ev = getEnv(self)
                // self.fileStoreReady = false
                // ev.os.exeExitback('touch ' + filePathName, self.refresh)
                ev.os.exeExitback('touch ' + filePathName, () => {})
                ev.tabs.addTab({name: tmpFile, path: self.lastClickNode.path}, '')
            }else if(e.keyCode === 27){
                self.handleNewTagInputDelete()
            }
        },
        handleNewTagInputDelete(){
            if(NewTagInputRef.current !== undefined){
                NewTagInputRef.current.removeEventListener('blur', self.handleNewTagInputDelete)
            }
            const PARENT = getParent(self.lastClickNode)

            if(self.lastClickNode.type !== 'file'){
                self.folderExpandCollec.pop()
            }
            PARENT.pop()
            self.lastClick = self.tmpLastClick
            self.lastClickNode.isCurrent = true
        },
        addNewTagInputBlurListener(ref){
            self.setNewTagInputRef(ref)
            ref.current.addEventListener('blur', self.handleNewTagInputDelete)
        },
        collapseAll(){
            self.folderExpandCollec.forEach(c => {
                resolvePath(self.directory, c).isExpend = false
            })
            self.lastClickNode.isCurrent = false
            self.folderExpandCollec = []
            self.lastClick = ''
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
        },
        setNewTagInputRef(ref){
            NewTagInputRef = ref
        },
        getNewTagInputRef(){
            return NewTagInputRef
        }
    }))

export default fileStore
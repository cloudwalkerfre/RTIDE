import { types, getEnv, getRelativePath, resolvePath, tryResolve, getSnapshot, getParent, hasParent, resolveIdentifier, getType } from "mobx-state-tree"

/*
    There should be a better name for this, directory is kind of missleading,
    because it could be either a file or folder, but since we use recursion
    all the time, it's the temp selution as for now

    Reason why I use jsonPath instead of id as the identifier for lastClickNode is that
    we might need to add rename feature, id can't be renamed once it created

    TODO:
        - better comment
        - rename path to pwd in directory and browsix/usr/bin/treejson
        - handle fresh after file operation made in terminal
            - option 1: set flag, don't do folder expand after terminal operation
            - option 2: hard coding
            fuck me...
        - scroll to node after refresh
        - first time writting file folder, what a mess...
        - reorganize when all things settled
        - Notification for illegal dirname input, ex: dirname start with number bring render issue
        - don't allow same name mkdir/newFile
        - rename
        - drag & drop
*/

let FileViewRef
let NewTagInputRef

const directory = types
    .model('directory', {
        id: types.identifier,
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
        isFileStoreReady: false,
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
        /*
            Demo phase temp example, will have server fetch data once finished
        */
        init(tree){
            const ev = getEnv(self)
            ev.os.exeExitback('mkdir home && touch home/test.py && echo "import sys\nsys.version" > home/test.py', () => {})

            const treejson = JSON.parse(tree)
            self.directory = directory.create(treejson)

            self.setNewNode('/', self.directory.children, 'folder', 'home')
            self.setNewNode('/home', self.lastClickNode.children, 'file', 'test.py')
            self.isFileStoreReady = true

            ev.tabs.addTab({id: '/home/test.py', name: 'test.py', path: '/home'},
            'import sys\nsys.version\n\n' +
            '#import 3rd party package will take sometime to load\n' +
            '#import numpy as np\n#np.array([1, 2, 3])')
        },
        setDirectory(treejson){
            treejson.isExpend = true
            self.directory = directory.create(treejson)
            self.isFileStoreReady = true
        },
        getDirectory(){
            return self.directory
        },
        getIsFileStoreReady(){
            return self.isFileStoreReady
        },
        handleClick(file){
            if(file.isNameEdit){
                return
            }
            const jsonPath = getRelativePath(self.directory, file)
            if(file.type === 'file'){
                if(self.lastClick !== jsonPath){
                    const ev = getEnv(self)

                    if(file.isOpen){
                        ev.tabs.addTab({id: file.id, name: file.name, path: file.path}, '')
                    }else{
                        let catReturn = ''
                        ev.os.exeCallback('cat '+ file.path + '/' + file.name,
                            () => ev.tabs.addTab({id: file.id, name: file.name, path: file.path}, catReturn),
                            (string) => catReturn = string
                        )
                    }
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
            self.isFileStoreReady = false
            const tmpExpands = getSnapshot(self.folderExpandCollec)
            // console.log(tmpExpands)
            const tmpCurrent = self.lastClick
            ev.os.exeCallback('treejson',
                () => {},
                (tree) => {
                    self.setDirectory(JSON.parse(tree))
                    // ev.tabs.refresh()
                    self.setFolderExpand(tmpExpands)
                    self.setLastClick(tmpCurrent)
                }
            )
        },
        mkdir1(){
            const { PATH, PARENT } = self.getLastClickRelativePosition()
            self.setNewNode(PATH, PARENT, 'folder', 'tmpFolder', true)
        },
        /* TODO: handle newDir of the same name */
        mkdir2(e){
            if(e.keyCode === 13 && e.target.value !== ''){
                const newFolderName = e.target.value
                /*
                    - nodeName start with number bring render issue
                    - name contains '/' is illegal in unix file system
                    - don't allow space
                    TODO: Illegal name Notification
                */
                if(newFolderName.match(/^\d|\u0020+|\//g) !== null){
                    self.handleNewTagInputDelete()
                    return
                }
                self.handleNewTagInputDelete()

                const { PATH, PARENT } = self.getLastClickRelativePosition()
                self.setNewNode(PATH, PARENT, 'folder', newFolderName)

                const ev = getEnv(self)
                // self.isFileStoreReady = false
                // ev.os.exeExitback('mkdir ' + self.lastClickNode.id, self.refresh)
                ev.os.exeExitback('mkdir ' + self.lastClickNode.id, () => {})
            }else if(e.keyCode === 27){
                self.handleNewTagInputDelete()
            }
        },
        newFile1(){
            const { PATH, PARENT } = self.getLastClickRelativePosition()
            self.setNewNode(PATH, PARENT, 'file', 'tmpFile', true)
        },
        newFile2(e){
            if(e.keyCode === 13 && e.target.value !== ''){
                const newFileName = e.target.value
                /*
                    - nodeName start with number bring render issue
                    - name contains '/' is illegal in unix file system
                    - don't allow space
                    TODO: Illegal name Notification
                */
                if(newFileName.match(/^\d|\u0020+|\//g) !== null){
                    self.handleNewTagInputDelete()
                    return
                }
                self.handleNewTagInputDelete()

                const { PATH, PARENT } = self.getLastClickRelativePosition()
                self.setNewNode(PATH, PARENT, 'file', newFileName)

                const ev = getEnv(self)
                ev.os.exeExitback('touch ' + self.lastClickNode.id, () => {})
                ev.tabs.addTab({id: self.lastClickNode.id, name: self.lastClickNode.name, path: self.lastClickNode.path}, '')
            }else if(e.keyCode === 27){
                self.handleNewTagInputDelete()
            }
        },
        saveFile(str, id){
            const ev = getEnv(self)
            // console.log(str.replace('"', '\"'))
            // ev.os.exeExitback('echo "' + str + '" > ' + id,
            //     () => { console.log(id + ' saved!') }
            // )
            ev.os.getFs().writeFile(id, str, () => console.log(id + ' saved!'))
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
                try {
                    resolvePath(self.directory, c).isExpend = false
                } catch(e){}
            })
            self.lastClickNode.isCurrent = false
            self.folderExpandCollec = []
            self.lastClick = ''
        },
        setFolderExpand(expands){
            self.folderExpandCollec = []
            expands.forEach(c => {
                try {
                    resolvePath(self.directory, c).isExpend = true
                    self.folderExpandCollec.push(c)
                } catch(e){}
            })
        },
        setDirectoryReady(){
            self.isFileStoreReady = true
        },
        setLastClick(last){
            try {
                if(self.lastClick !== ''){
                    self.lastClickNode.isCurrent = false
                }
                const lastNode = resolvePath(self.directory, last)
                lastNode.isCurrent = true
                self.lastClick = last

                self.getParentExpande(lastNode)
            } catch(e){}
        },
        getParentExpande(lastNode){
            if(hasParent(lastNode, 2)){
                const parent = getParent(lastNode, 2)
                if(!parent.isExpend){
                    parent.isExpend = true
                    self.folderExpandCollec.push(getRelativePath(self.directory, parent))
                }
                if(hasParent(parent, 2)){
                    self.getParentExpande(parent)
                }
            }
        },
        getLastClickRelativePosition(){
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
            return {PATH: PATH, PARENT: PARENT}
        },
        setNewNode(PATH, PARENT, TYPE, NAME, isNameEdit = false){
            let newNode
            let ID
            if(PATH === '/'){
                ID = PATH + NAME
            }else{
                ID = PATH + '/' + NAME
            }
            if(TYPE === 'file'){
                newNode = directory.create({
                    id: ID,
                    name: NAME,
                    path: PATH,
                    type: 'file',
                    isCurrent: true,
                    isOpen: false,
                    isExpend: false,
                    isNameEdit: isNameEdit
                })
            }else{
                newNode = directory.create({
                    id: ID,
                    name: NAME,
                    path: PATH,
                    type: 'dir',
                    isCurrent: true,
                    isOpen: false,
                    isExpend: true,
                    isNameEdit: isNameEdit,
                    children: []
                })
            }
            PARENT.push(newNode)
            if(self.lastClick !== ''){
                self.lastClickNode.isCurrent = false
            }
            const newNodeJsonPath = getRelativePath(self.directory, newNode)
            self.lastClick = newNodeJsonPath

            if(TYPE === 'folder'){
                self.folderExpandCollec.push(newNodeJsonPath)
            }
            self.getParentExpande(self.lastClickNode)
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
        },
        getNodeById(ID){
            return resolveIdentifier(getType(self.directory), self.directory, ID)
        }
    }))

export default fileStore
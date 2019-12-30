import { types, getEnv, getRelativePath, resolvePath } from 'mobx-state-tree';
import { version } from 'react';

/*
    tab should just use fileStore reference, but as for now, we do it seperately
    because there might be some tab type other than mono-editor - e.g, MarkDown page
*/


const tab = types.model('tab', {
        id: types.string,
        name: types.string,
        path: types.string,
        isCurrent: false
    })

const tabStore = types.model('tabs', {
        tabs: types.array(types.maybe(tab)),
        current: ''
    })
    .views(self=> ({
        get currentNode(){
            return resolvePath(self.tabs, self.current)
        }
    }))
    .actions(self => ({
        getTabs(){
            return self.tabs
        },
        addTab(tabJson, string){
            const ev = getEnv(self)
            const add = () => {
                ev.editor.newMono(string, tabJson.id)
                tabJson.isCurrent = true
                const newTab = tab.create(tabJson)
                self.tabs.push(newTab)
                if(self.current !== ''){
                    self.currentNode.isCurrent = false
                }
                const tabPath = getRelativePath(self.tabs, newTab)
                self.current = tabPath
            }

            if(self.tabs.length === 0){
                add()
            }else{
                const tabSearch = self.tabs.filter(t => t.id === tabJson.id)
                if(tabSearch.length !== 0){
                    tabSearch[0].isCurrent = true
                    self.currentNode.isCurrent = false
                    self.current = getRelativePath(self.tabs, tabSearch[0])
                    ev.editor.newMono(string, tabJson.id)
                }else{
                    add()
                }
            }
        },
        handleClick(tab){
            const ev = getEnv(self)
            if(tab !== self.currentNode){
                tab.isCurrent = true
                self.currentNode.isCurrent = false
                self.current = getRelativePath(self.tabs, tab)
                ev.editor.newMono('', tab.id)
            }
            try {
                const tmpNodeInFileView = ev.file.getNodeById(tab.id)
                ev.file.setLastClick(getRelativePath(ev.file.directory, tmpNodeInFileView))
            } catch (error) {
                console.log(error)
            }
        },
        handleClose(tab){
            if(self.tabs.length > 1){
                const ev = getEnv(self)

                if(ev.editor.getIsEditorEdited(tab.id)){
                    const str = ev.editor.getEditorValue(tab.id)
                    ev.file.saveFile(str, tab.id)
                }

                let index
                const tabSearch = self.tabs.map((t, i) => {
                    if(t.id === tab.id){
                        index = i
                        return
                    }
                })
                if(self.tabs[index].isCurrent){
                    const tmpNewCurrent = self.tabs[index === 0 ? 1 : index - 1]
                    self.tabs.splice( index, 1 )
                    self.current = getRelativePath(self.tabs, tmpNewCurrent)
                    tmpNewCurrent.isCurrent = true

                    ev.editor.newMono('', tmpNewCurrent.id)

                    try {
                        const tmpNodeInFileView = ev.file.getNodeById(tmpNewCurrent.id)
                        ev.file.setLastClick(getRelativePath(ev.file.directory, tmpNodeInFileView))
                    } catch (error) {
                        console.log(error)
                    }
                }else{
                    const tmpLastNode = resolvePath(self.tabs, self.current)
                    self.tabs.splice( index, 1 )
                    self.current = getRelativePath(self.tabs, tmpLastNode)
                }
            }
        }
    }))

export default tabStore;

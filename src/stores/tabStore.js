import { types, getEnv, getRelativePath, resolvePath } from 'mobx-state-tree';

const tab = types.model('tab', {
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
        },
        get tabId(){
            return self.currentNode.path + '/' + self.currentNode.name
        }
    }))
    .actions(self => ({
        getTabs(){
            return self.tabs
        },
        addTab(tabJson, string){
            const ev = getEnv(self)
            const add = () => {
                ev.editor.newMono(string, tabJson.path + '/' + tabJson.name)
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
                const tabSearch = self.tabs.filter(t => t.path + '/' + t.name === tabJson.path + '/' + tabJson.name)
                if(tabSearch.length !== 0){
                    tabSearch[0].isCurrent = true
                    self.currentNode.isCurrent = false
                    self.current = getRelativePath(self.tabs, tabSearch[0])
                    ev.editor.newMono(string, tabJson.path + '/' + tabJson.name)
                }else{
                    add()
                }
            }
        },
        handleClick(tab){
            const ev = getEnv(self)

            if(self.current !== '' && tab !== self.currentNode){
                tab.isCurrent = true
                self.currentNode.isCurrent = false
                self.current = getRelativePath(self.tabs, tab)

                let catReturn = ''
                ev.os.exeCallback('cat '+ tab.path + '/' + tab.name,
                    () => ev.editor.newMono(catReturn, tab.path + '/' + tab.name),
                    (string) => catReturn = string
                )
            }
        },
        handleClose(tab){
            if(self.tabs.length > 1){
                let index
                const tabSearch = self.tabs.map((t, i) => {
                    if(t.path + '/' + t.name === tab.path + '/' + tab.name){
                        index = i
                        return
                    }
                })
                if(self.tabs[index].isCurrent){
                    const ev = getEnv(self)

                    const tmpNewCurrent = self.tabs[index === 0 ? 1 : index - 1]
                    self.tabs.splice( index, 1 )
                    self.current = getRelativePath(self.tabs, tmpNewCurrent)
                    tmpNewCurrent.isCurrent = true

                    let catReturn = ''
                    ev.os.exeCallback('cat '+ tmpNewCurrent.path + '/' + tmpNewCurrent.name,
                        () => ev.editor.newMono(catReturn, tmpNewCurrent.path + '/' + tmpNewCurrent.name),
                        (string) => catReturn = string
                    )
                }else{
                    const tmpLastNode = resolvePath(self.tabs, self.current)
                    self.tabs.splice( index, 1 )
                    self.current = getRelativePath(self.tabs, tmpLastNode)

                }
            }
        }
    }))

export default tabStore;

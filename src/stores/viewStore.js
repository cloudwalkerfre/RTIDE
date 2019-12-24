import { types } from 'mobx-state-tree';

const viewStore = types.model('view', {
        tabs: types.array(types.string)
    }).actions(self => ({
        getTabs(){
            return self.tabs
        }
    }))

export default viewStore;

import { types } from "mobx-state-tree"
import { wrap } from 'comlink'
// import { createObjectBuffer } from "@bnaya/objectbuffer"

/*
    script for starting the pyodide webworker is at pyodide/py.worker.js
*/
const worker = new Worker(process.env.PUBLIC_URL + '/pyodide/py.worker.js')
const wp = wrap(worker)
const pyodide = wp.pyodide
// const sabObj = createObjectBuffer(
//     {
//       textEncoder: new TextEncoder(),
//       textDecoder: new TextDecoder()
//     },
//     1024,
//     { pyodideReady: false },
//     { useSharedArrayBuffer: true }
//   )

const pyStore = types
    .model("py", {
        isPyodideReady : false
    })
    .actions(self => ({
        setPyodideReady(){
            self.isPyodideReady = true
        },
        run(data){
            if(self.isPyodideReady){
                return pyodide.runPython(data)
            }else{
                // throw new Error('Pyodide Not Ready!')
                console.error('Pyodide Not Ready!')
            }
        },
        checkPyReady(){
            const checkPy = setInterval(async () => {
                if(await wp.pyodideReady){
                    self.setPyodideReady()
                    clearInterval(checkPy)
                }
            }, 100)
        }
    }))

export default pyStore
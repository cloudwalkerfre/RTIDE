import { types, getEnv } from "mobx-state-tree"
import { FileFlag } from 'browserfs/dist/node/core/file_flag'
import ansi from 'ansi-escape-sequences'

/*
    This should be two seperate store: terminal and os,
    but as for now, I decided to manage them both here,
    browsix and xterm together require crazy amount of
    knowledge as well as hacking, it's just easier this way

    为了开发调试方便，term和os两个store合一起了，方法也很乱，以后
    架子搭起来了再重构吧

    Browsix build参考了ids1024大神的branch（https://github.com/ids1024/browsix）
    他把xterm.js做了进去（官方老版本的是bower_components，很麻烦）

    Browsix boot参考了Alice@Ahmed Ghoneim，修改了异步循环方法，
    现在可以得到IndexDB完全加载后的明确状态（目的是跑一个文件treejson，
    以便React文件View初始化）

    Xterm字符处理很复杂，这种terminal输入问题本身一直就很麻烦，所以目前
    只是保证基本可用，复杂的keyBinding以后有时间慢慢打磨吧
*/

let kernel
let xterm
let stdin = null

const boot = (afterBoot) => {
    console.log('Browsix Booting...')
    window.Boot(
        'IndexedDB',
        [() =>
            initFS(kernel.fs, afterBoot)
        ],
        // 'XmlHttpRequest',
        // ['index.json', 'browsix', true],
        (err, k) => {
            if (err) {
                console.error(err);
                xterm.clear();
                xterm.writeln('Browsix Boost ERROR', err);
                // throw new Error(err);
            }
            kernel = k
        },
        { readOnly: false }
    )
}

const initBootFS = () => {
    const BrowsixFSes = window.BrowsixFSes
    const FileSystem = BrowsixFSes()

    return new FileSystem.XmlHttpRequest('index.json', 'browsix')
}

const initFS = async (userFS, afterBoot) => {
    try {
        const bootFS = await initBootFS()

        const readdir = (path) => new Promise((resolve, reject) => {
            bootFS.readdir(path, (err, dir) => {
                if (err)
                    reject(err)
                resolve(dir)
            })
        })

        const readFile = (path) => new Promise((resolve, reject) => {
            bootFS.readFile(path, 'utf8', FileFlag.getFileFlag('r'), (err, contents) => {
                if (err)
                    reject(err)
                resolve(contents)
            })
        })

        const mkdir = (path) => new Promise((resolve, reject) => {
            userFS.mkdir(path, (err) => {
                if (err)
                    reject(err)
                resolve()
            })
        })

        const writeFile = (path, contents) => new Promise((resolve, reject) => {
            userFS.writeFile(path, contents, (err) => {
                if (err)
                    reject(err)
                resolve()
            })
        })

        const exists = (path) => new Promise((resolve) => {
            userFS.exists(path, (exists) => resolve(exists))
        })

        const asyncForEachFilePath = async (array, callback) => {
            for (let index = 0; index < array.length; index++) {
                await callback(array.slice(0, index + 1).join('/'))
            }
        }

        const asyncForEach = async (array, callback) => {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index])
            }
        }

        const copyFile = async (file) => {
            if (!userFS.existsSync(file)) {
                const stats = bootFS.statSync(`/${file}`)

                if (stats.isDirectory()) {
                    const path = file.split('/')

                    const makeDir = async () => {
                        await asyncForEachFilePath(path, async (joinedPath) => {
                            const doesExist = await exists(`/${joinedPath}`)
                            if (!doesExist) {
                                await mkdir(`/${joinedPath}`)
                            }
                        })
                    }
                    await makeDir()

                    const children = await readdir(`/${file}`)
                    const copyChild = async () => {
                        await asyncForEach(children, async (child) => {
                            await copyFile(`${file}/${child}`)
                        })
                    }
                    await copyChild()

                } else if (stats.isFile()) {
                    const path = `/${file}`
                    const doesExist = await exists(path)

                    if (!doesExist) {
                        const contents = await readFile(path)
                        await writeFile(`/${file}`, contents)
                    }
                }
            }
        }

        const files = await readdir('/')
        const copyFS = async () => {
            await asyncForEach(files, async (file) => {
                await copyFile(`${file}`)
            })
        }
        await copyFS()
        // await mkdir('/home')
        console.log('indexDB loaded!')
        afterBoot()
    } catch (e){
        console.error(e)
    }
}

const onExit = (pid, code, cwd) => {
    // console.log(pid, code)
    // xterm.writeln(code)
    stdin = null
    xterm.writeln('')
    xterm.write(cwd)
}
const onStdout = (pid, out) => {
    xterm.write(outStyled(out.replace(/\n/g, "\r\n")))
    // console.log('onStdout', pid, ouput)
}
const onStderr = (pid, err) => {
    xterm.write(errStyled(err.replace(/\n/g, "\r\n")))
    // console.log('onStderr', pid, ouput)
}
const onHaveStdin = (pipe) => {
    stdin = pipe
    // console.log('onHaveStdin', pipe)
}

const cmdStyled = string => ansi.format(string, ['bold', 'italic', 'green'])
const outStyled = string => ansi.format(string, ['white'])
const errStyled = string => ansi.format(string, ['red', 'italic', 'bold'])

const osStore = types
    .model('os',{
        isKernelReady: false,
        isXtermReady: false,
        isKernelBusy: false,
        cwd: ansi.format('[black bg-white bold]{$~/RTIDE}[black bg-green bold]{>}'),
        line: '',
        lineIdx: 0,
        history: types.array(types.string),
        historyIdx: 1
    })
    .actions(self => ({
        osBoot(){
            self.isKernelBusy = true
            boot(self.initKernel)
            self.welcome()
        },
        setKernelReady(){
            self.isKernelReady = true
        },
        setIsKernelBusy(busy){
            self.isKernelBusy = busy
        },
        initKernel(){
            const env = getEnv(self)
            self.setKernelReady()
            /*
                We boot fileStore's directory here as well
            */
            self.exeCallback('treejson',
                () => {},
                env.file.init
            )
            console.log(cmdStyled('Browsix Booted!'))
        },
        welcome(){
            const ct = setInterval(() => {
                if(self.isOSXtermReady()){
                    xterm.write(ansi.erase.inLine(2) + '\r')
                    xterm.write(cmdStyled('Welcome to RTIDE! ' + new Date()))
                    xterm.writeln('')
                    xterm.write(self.cwd)
                    console.log(cmdStyled('Welcome to RTIDE! '))
                    self.setIsKernelBusy(false)
                    clearInterval(ct)
                }else{
                    if(self.isXtermReady){
                        xterm.write(cmdStyled('.'))
                    }
                }
            }, 100)
        },
        setXterm(terminal){
            xterm = terminal
            self.isXtermReady = true
        },
        exec(cmd){
            if(cmd !== null && cmd !== ''){
                kernel.system(
                    cmd,
                    (pid, code) => onExit(pid, code, self.cwd),
                    onStdout,
                    onStderr,
                    onHaveStdin
                )
            }else{
                xterm.writeln('')
                xterm.write(self.cwd)
            }
        },
        exeCallback(cmd, onExit, onOutput){
            if(cmd !== null && cmd !== ''){
                kernel.system(
                    cmd,
                    (pid, code) => {
                        /*onExit(pid, code, self.cwd)*/
                        onExit()
                    },
                    (pid, out) => {
                        // onStdout(pid, out)
                        onOutput(out)
                    },
                    onStderr,
                    onHaveStdin
                )
            }else{
                xterm.writeln('')
                xterm.write(self.cwd)
            }
        },
        exeExitback(cmd, callback){
            if(cmd !== null && cmd !== ''){
                kernel.system(
                    cmd,
                    (pid, code) =>{
                        /*onExit(pid, code, self.cwd)*/
                        callback()
                    },
                    (pid, out) => {
                        // onStdout(pid, out)
                    },
                    onStderr,
                    onHaveStdin
                )
            }else{
                xterm.writeln('')
                xterm.write(self.cwd)
            }
        },
        termWrite(out){
            if(out && out !== undefined){
                xterm.writeln('')
                const tmpString = outStyled(out.toString().replace(/\n/g, '\r\n'))
                xterm.writeln(new Buffer(tmpString))
                xterm.write(self.cwd)
            }
        },
        isOSXtermReady(){
            return self.isKernelReady && self.isXtermReady
        },
        keyCallback({key, domEvent}){
            if(!self.isOSXtermReady()){
                xterm.writeln('OS not ready!')
                return
            /* Enter */
            }else if(domEvent.keyCode === 13){
                xterm.writeln('')
                self.exec(self.line)
                self.history.push(self.line)
                self.line = ''
                self.lineIdx = 0
                self.historyIdx = 0
            /* Delete */
            }else if(domEvent.keyCode === 8){
                if(self.lineIdx > 0){
                    const previous = self.line.slice(0, self.lineIdx - 1)
                    const rest = self.line.slice(self.lineIdx)
                    xterm.write('\b' + cmdStyled(rest) + ' ' + '\b'.repeat(rest.length + 1))
                    self.line = previous + rest
                    self.lineIdx--
                }
            /* Arrow Left */
            }else if(domEvent.keyCode === 37){
                if(self.lineIdx > 0){
                    self.lineIdx--
                    xterm.write(key)
                }
            /* Arrow right */
            }else if(domEvent.keyCode === 39){
                if (self.lineIdx < self.line.length) {
                    self.lineIdx++
                    xterm.write(key)
                }
            /* Arrow Up */
            }else if(domEvent.keyCode === 38){
                domEvent.preventDefault()
                const hisLen = self.history.length
                if(hisLen !== 0 && self.historyIdx < hisLen){
                    self.historyIdx++
                    const goHis = hisLen - self.historyIdx
                    xterm.write(ansi.erase.inLine(2) + '\r')
                    xterm.write(self.cwd + cmdStyled(self.history[goHis]))
                    self.line = self.history[goHis]
                    self.lineIdx = self.history[goHis].length
                }
            /* Arrow Down */
            }else if(domEvent.keyCode === 40){
                domEvent.preventDefault()
                const hisLen = self.history.length
                if(hisLen !== 0 && self.historyIdx > 0){
                    const goHis = hisLen - self.historyIdx
                    self.historyIdx--
                    if(self.historyIdx === 0){
                        xterm.write(ansi.erase.inLine(2) + '\r')
                        xterm.write(self.cwd)
                        self.line = ''
                        self.lineIdx = 0
                    }else{
                        const prev = hisLen - self.historyIdx
                        xterm.write(ansi.erase.inLine(2) + '\r')
                        xterm.write(self.cwd + cmdStyled(self.history[prev]))
                        self.line = self.history[prev]
                        self.lineIdx = self.history[goHis].length
                    }
                }
            }else{
                // if(key === '\x01'){
                //     console.log('Ctrl + A')
                // }
                if(self.lineIdx < self.line.length){
                    const previous = self.line.slice(0, self.lineIdx)
                    const rest = self.line.slice(self.lineIdx)
                    self.line = previous + key + rest
                    self.lineIdx++
                    xterm.write(ansi.erase.inLine(0) + cmdStyled(key + rest) + '\b'.repeat(rest.length))
                }else{
                    self.line += key
                    self.lineIdx++
                    xterm.write(cmdStyled(key))
                }
            }
        }
    }))

export default osStore
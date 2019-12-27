
### RTIDE

---

This project is made possible by the following amazing project: [`pyodide`](https://github.com/iodide-project/pyodide/), [`browsix`](https://github.com/plasma-umass/browsix), [`xterm.js`](https://github.com/xtermjs/xterm.js), [`monaco`](https://github.com/SurenAt93/monaco-react/), [`ComLink`](https://github.com/GoogleChromeLabs/comlink), `mobx-state-tree` and `React`


PROJECT IN DEVELOPMENT...
项目开发中...

Chrome only! Please make sure you have the latest version.

----

First you need to build the [pyodide](https://github.com/iodide-project/pyodide)(or download a build version from [here](https://github.com/iodide-project/pyodide/releases/)), and cp all the file in to ./public/pyodide, There is already a `py.woker.js` file in that folder, keep it, then =>

```shell
yarn install
yarn start
```
should do

---

- Browsix allows you to run some simple POSIX style command, like _ls/mkdir/touch/rm/grep/cat..._, combine it with xterm.js, you got a mini OS running in your browser.
- Pyodide allows you to run Python in your browser with the help of WebAssembly, together they can really be something.

This project require crazy amount of knowledge, especially for a newbie like me, not to mention all the tech stacks are fairly new, so I'm gonna take my time, try push as far as I can.

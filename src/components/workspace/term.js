import React, { useRef, useEffect, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { useStore } from '../../hooks/useStore'
import 'xterm/css/xterm.css'

const Term = (props = {}) => {
	const store = useStore()
	const termRf = useRef(null)
	const fitAddon = new FitAddon()
	const [ xterm, setXterm ] = useState(null)
	const { onInit, config = {} } = props

	const terminalOpts = {
		allowTransparency: true,
		fontFamily: 'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
		fontSize: 14,
		theme: {
			background: '#202124',
			foreground: '#ffffff73'
		},
		cursorStyle: 'underline',
		cursorBlink: true,
		disableStdin: false,
		...(config || {})
	}

	useEffect(() => {
		const terminal = new Terminal(terminalOpts)
		setXterm(terminal)
	}, [])

	useEffect(() => {
		const handleTerminalInit = async () => {
			if (termRf.current && xterm) {
				const webLinksAddon = new WebLinksAddon()
				store.os.setXterm(xterm)
				xterm.loadAddon(fitAddon)
				xterm.loadAddon(webLinksAddon)
				xterm.onKey(store.os.keyCallback)
				// last open
				xterm.open(termRf.current)
				fitAddon.fit()
				if (onInit) {
					onInit(xterm, fitAddon)
				}
			}
		}
		handleTerminalInit()
	},[ termRf, xterm ])

	return <div ref={ termRf } className="terminal-container" />
}

export default Term

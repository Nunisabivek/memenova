"use client"
import { useEffect, useRef } from 'react'

type IframeUnitProps = {
	type: 'iframe'
	keyId: string
	scriptSrc: string
	width: number
	height: number
	params?: Record<string, unknown>
}

type NativeUnitProps = {
	type: 'native'
	containerId: string
	scriptSrc: string
}

export type AdsterraBannerProps = IframeUnitProps | NativeUnitProps

declare global {
	interface Window {
		atOptions?: any
	}
}

export function AdsterraBanner(props: AdsterraBannerProps) {
	const initialized = useRef(false)

	useEffect(() => {
		if (initialized.current) return
		initialized.current = true

		if (props.type === 'iframe') {
			// Configure global before loading script
			window.atOptions = {
				key: props.keyId,
				format: 'iframe',
				height: props.height,
				width: props.width,
				params: props.params || {},
			}
			const s = document.createElement('script')
			s.type = 'text/javascript'
			s.src = props.scriptSrc.startsWith('http') ? props.scriptSrc : `https:${props.scriptSrc}`
			s.async = true
			document.body.appendChild(s)
			return
		}

		// Native container-based unit
		const s = document.createElement('script')
		s.type = 'text/javascript'
		s.async = true
		s.setAttribute('data-cfasync', 'false')
		s.src = props.scriptSrc.startsWith('http') ? props.scriptSrc : `https:${props.scriptSrc}`
		document.body.appendChild(s)
	}, [props])

	if (props.type === 'native') {
		return <div id={props.containerId} style={{ width: '100%' }} />
	}

	// For iframe units, nothing to render; the script injects the iframe
	return <div style={{ width: props.width, height: props.height }} />
}



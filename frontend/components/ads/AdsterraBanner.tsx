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
		adsterraLoaded?: Set<string>
	}
}

export function AdsterraBanner(props: AdsterraBannerProps) {
	const initialized = useRef(false)
	const mountRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (initialized.current) return
		if (typeof window === 'undefined') return
		
		initialized.current = true

		// Prevent duplicate script loading
		if (!window.adsterraLoaded) {
			window.adsterraLoaded = new Set()
		}

		const container = mountRef.current || document.body

		if (props.type === 'iframe') {
			const scriptKey = `iframe-${props.keyId}`
			if (window.adsterraLoaded.has(scriptKey)) return

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
			s.onerror = () => console.warn('Failed to load Adsterra script')
			container.appendChild(s)
			window.adsterraLoaded.add(scriptKey)
			return
		}

		// Native container-based unit
		const scriptKey = `native-${props.containerId}`
		if (window.adsterraLoaded.has(scriptKey)) return

		const s = document.createElement('script')
		s.type = 'text/javascript'
		s.async = true
		s.setAttribute('data-cfasync', 'false')
		s.src = props.scriptSrc.startsWith('http') ? props.scriptSrc : `https:${props.scriptSrc}`
		s.onerror = () => console.warn('Failed to load Adsterra script')
		container.appendChild(s)
		window.adsterraLoaded.add(scriptKey)
	}, [props])

	if (props.type === 'native') {
		return (
			<div ref={mountRef} style={{ width: '100%' }}>
				<div id={props.containerId} style={{ width: '100%' }} />
			</div>
		)
	}

	// For iframe units, provide a mount container so the script injects inside the box
	return <div ref={mountRef} style={{ width: props.width, height: props.height }} />
}



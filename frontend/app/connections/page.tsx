"use client"
import Image from 'next/image'
import { useEffect, useState } from 'react'

type Provider = 'instagram' | 'facebook' | 'youtube'

const providers: { key: Provider; name: string; logo: string }[] = [
	{ key: 'instagram', name: 'Instagram', logo: '/logos/instagram.svg' },
	{ key: 'facebook', name: 'Facebook', logo: '/logos/facebook.svg' },
	{ key: 'youtube', name: 'YouTube', logo: '/logos/youtube.svg' },
]

export default function ConnectionsPage() {
	const [plan, setPlan] = useState('')
	const [connected, setConnected] = useState<Record<Provider, boolean>>({ instagram: false, facebook: false, youtube: false })
	const limit = plan === 'PRO MAX' ? 3 : plan === 'PRO' ? 1 : 0
	const connectedCount = Object.values(connected).filter(Boolean).length

	useEffect(() => {
		if (typeof window !== 'undefined') setPlan(localStorage.getItem('userPlan') || '')
	}, [])

	function connect(key: Provider) {
		if (!plan) return alert('Sign in to connect accounts.')
		if (connected[key]) return
		if (connectedCount >= limit) return alert(`Limit reached for your plan (${plan}).`)
		setConnected(prev => ({ ...prev, [key]: true }))
	}

	function disconnect(key: Provider) {
		setConnected(prev => ({ ...prev, [key]: false }))
	}

	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<h1 className="text-2xl font-bold mb-2">Connections</h1>
			<p className="text-secondary-600 mb-6">Plan: {plan || 'Free'} · Limit: {limit}</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{providers.map((p) => (
					<div key={p.key} className="border rounded-lg p-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Image src={p.logo} alt={p.name} width={24} height={24} />
							<div>
								<div className="font-semibold">{p.name}</div>
								<div className="text-xs text-secondary-600">{connected[p.key] ? 'Connected' : 'Not connected'}</div>
							</div>
						</div>
						{connected[p.key] ? (
							<button onClick={() => disconnect(p.key)} className="px-3 py-2 text-sm rounded-md border border-secondary-300 hover:bg-secondary-50">Disconnect</button>
						) : (
							<button onClick={() => connect(p.key)} className="px-3 py-2 text-sm rounded-md bg-primary-600 text-white">Connect</button>
						)}
					</div>
				))}
			</div>
		</div>
	)
}



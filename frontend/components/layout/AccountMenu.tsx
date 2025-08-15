"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'

export function AccountMenu() {
	const [open, setOpen] = useState(false)
	const [email, setEmail] = useState<string>('')
	const [plan, setPlan] = useState<string>('')

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setEmail(localStorage.getItem('userEmail') || '')
			setPlan(localStorage.getItem('userPlan') || '')
		}
	}, [])

	return (
		<div className="relative">
			<button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-secondary-200 hover:bg-secondary-50">
				<Menu className="w-4 h-4" />
				<span>{email || 'Account'}</span>
			</button>
			{open && (
				<div className="absolute right-0 mt-2 w-56 rounded-md border border-secondary-200 bg-white shadow-lg z-50">
					<div className="px-3 py-2 text-xs text-secondary-600">Plan: {plan || 'Free'}</div>
					<div className="h-px bg-secondary-200" />
					<div className="py-1 text-sm">
						<Link href="/account" className="block px-3 py-2 hover:bg-secondary-50">Account</Link>
						<Link href="/billing" className="block px-3 py-2 hover:bg-secondary-50">Billing</Link>
						<Link href="/connections" className="block px-3 py-2 hover:bg-secondary-50">Connections</Link>
					</div>
				</div>
			)}
		</div>
	)
}



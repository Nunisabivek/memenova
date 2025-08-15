export default function ConnectionsPage() {
	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<h1 className="text-2xl font-bold mb-4">Connections</h1>
			<p className="text-secondary-600 mb-6">Connect your social accounts for auto-publishing. Limits: PRO (1), PRO MAX (3).</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="border rounded-lg p-4">
					<h2 className="font-semibold mb-2">Instagram</h2>
					<button className="px-3 py-2 text-sm rounded-md bg-primary-600 text-white">Connect</button>
				</div>
				<div className="border rounded-lg p-4">
					<h2 className="font-semibold mb-2">Facebook</h2>
					<button className="px-3 py-2 text-sm rounded-md bg-primary-600 text-white">Connect</button>
				</div>
				<div className="border rounded-lg p-4">
					<h2 className="font-semibold mb-2">YouTube</h2>
					<button className="px-3 py-2 text-sm rounded-md bg-primary-600 text-white">Connect</button>
				</div>
			</div>
		</div>
	)
}



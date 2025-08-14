export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="border rounded-md p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <ul className="mt-3 text-sm list-disc pl-4">
            <li>Image memes with ads</li>
            <li>Limited monthly generations</li>
            <li>Watermark</li>
          </ul>
        </div>
        <div className="border rounded-md p-6">
          <h2 className="text-xl font-semibold">Pro</h2>
          <ul className="mt-3 text-sm list-disc pl-4">
            <li>No ads</li>
            <li>Video memes up to 60s</li>
            <li>Auto-publish + captions</li>
          </ul>
        </div>
        <div className="border rounded-md p-6">
          <h2 className="text-xl font-semibold">Business</h2>
          <ul className="mt-3 text-sm list-disc pl-4">
            <li>Team seats</li>
            <li>Brand kit & analytics</li>
            <li>Priority rendering</li>
          </ul>
        </div>
      </div>
    </main>
  )
}



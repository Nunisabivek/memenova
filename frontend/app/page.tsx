import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold">MemeNova</h1>
      <p className="mt-4 text-lg text-neutral-700">AI-powered all-in-one meme studio for images and videos.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/studio" className="btn">Open Studio</Link>
        <Link href="/pricing" className="btn bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50">Pricing</Link>
      </div>
    </main>
  )
}



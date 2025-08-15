import axios from 'axios'
import sharp from 'sharp'

export type MemeTemplate = {
	Id: string
	Name: string
	Url: string
	Width: number
	Height: number
}

type ImgflipTemplate = {
	id: string
	name: string
	url: string
	width: number
	height: number
}

export async function fetchTopTemplates(limit = 100): Promise<MemeTemplate[]> {
	const { data } = await axios.get('https://api.imgflip.com/get_memes', { timeout: 10000 })
	if (!data?.success) return []
	const items: ImgflipTemplate[] = data.data?.memes || []
	return items.slice(0, limit).map(t => ({ Id: t.id, Name: t.name, Url: t.url, Width: t.width, Height: t.height }))
}

export async function composeTemplateMeme(args: {
	templateUrl: string
	topText?: string
	bottomText?: string
	width?: number
	quality?: number
}): Promise<Buffer> {
	const { templateUrl, topText = '', bottomText = '', width = 1024, quality = 90 } = args

	const imgResp = await axios.get<ArrayBuffer>(templateUrl, { responseType: 'arraybuffer', timeout: 15000 })
	const input = Buffer.from(imgResp.data)
	const base = sharp(input)
	const meta = await base.metadata()
	const targetWidth = width
	const scale = (meta.width && targetWidth) ? targetWidth / meta.width : 1
	const targetHeight = meta.height ? Math.round(meta.height * scale) : undefined

	// SVG overlay generator for top/bottom text
	const createTextSvg = (text: string, position: 'top'|'bottom') => {
		const W = targetWidth
		const H = targetHeight || Math.round((meta.height || 1024) * scale)
		const fontSize = Math.max(24, Math.round(W * 0.06))
		const y = position === 'top' ? fontSize * 1.3 : H - fontSize * 0.5
		const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
		return Buffer.from(
			`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
				<style>
					text { font-family: Impact, 'Arial Black', sans-serif; font-weight: 900; fill: #ffffff; stroke: #000000; stroke-width: ${Math.max(2, Math.round(fontSize/10))}px; paint-order: stroke fill; letter-spacing: 1px; }
				</style>
				<text x="50%" y="${y}" font-size="${fontSize}" text-anchor="middle">${esc(text).toUpperCase()}</text>
			</svg>`
		)
	}

	const overlays: { input: Buffer }[] = []
	if (topText) overlays.push({ input: createTextSvg(topText, 'top') })
	if (bottomText) overlays.push({ input: createTextSvg(bottomText, 'bottom') })

	let img = base.resize({ width: targetWidth })
	if (overlays.length) {
		img = img.composite(overlays)
	}

	return await img.jpeg({ quality, mozjpeg: true }).toBuffer()
}


export async function composeMemeOnImage(args: {
	imageUrl: string
	text?: string
	topText?: string
	bottomText?: string
	width?: number
	quality?: number
}): Promise<Buffer> {
	const { imageUrl, text = '', topText = '', bottomText = '', width = 1024, quality = 90 } = args

	const imgResp = await axios.get<ArrayBuffer>(imageUrl, { responseType: 'arraybuffer', timeout: 15000 })
	const input = Buffer.from(imgResp.data)
	const base = sharp(input)
	const meta = await base.metadata()
	const targetWidth = width
	const scale = (meta.width && targetWidth) ? targetWidth / meta.width : 1
	const targetHeight = meta.height ? Math.round(meta.height * scale) : undefined

	const createTextSvg = (t: string, position: 'top'|'bottom') => {
		const W = targetWidth
		const H = targetHeight || Math.round((meta.height || 1024) * scale)
		const fontSize = Math.max(24, Math.round(W * 0.06))
		const y = position === 'top' ? fontSize * 1.3 : H - fontSize * 0.5
		const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
		return Buffer.from(
			`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
				<style>
					text { font-family: Impact, 'Arial Black', sans-serif; font-weight: 900; fill: #ffffff; stroke: #000000; stroke-width: ${Math.max(2, Math.round(fontSize/10))}px; paint-order: stroke fill; letter-spacing: 1px; }
				</style>
				<text x="50%" y="${y}" font-size="${fontSize}" text-anchor="middle">${esc(t).toUpperCase()}</text>
			</svg>`
		)
	}

	let top = topText
	let bottom = bottomText
	if (!top && !bottom && text) {
		const midpoint = Math.floor(text.length / 2)
		top = text.slice(0, midpoint)
		bottom = text.slice(midpoint)
	}

	const overlays: { input: Buffer }[] = []
	if (top) overlays.push({ input: createTextSvg(top, 'top') })
	if (bottom) overlays.push({ input: createTextSvg(bottom, 'bottom') })

	let img = base.resize({ width: targetWidth })
	if (overlays.length) {
		img = img.composite(overlays)
	}

	return await img.jpeg({ quality, mozjpeg: true }).toBuffer()
}



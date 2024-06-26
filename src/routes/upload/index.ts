import { router } from '..'
import { auth } from '../../middleware/auth'
import { Env } from '../../types'
import { returnJSON } from '../../utils/webhook'

router.post('/anonUpload', async (request: Request, env: Env) => {
	let fileslug = Math.floor(Date.now() / 1000).toString()
	const filename = `${fileslug}`
	const contentType = request.headers.get('Content-Type')
	const contentLength = request.headers.get('Content-Length')
	const maxSize = 100 * 1024 * 1024 // 100 MB
	if (!contentType || !contentLength) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Content-Type or Content-Length header missing'
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		)
	} else if (Number.parseInt(contentLength) > maxSize) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'File size too large'
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		)
	}
	try {
		await env.R2_BUCKET.put(filename, request.body, {
			httpMetadata: {
				contentType: contentType,
				cacheControl: 'public, max-age=604800'
			}
		})
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal Server Error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		)
	}
	const returnUrl = new URL(request.url)
	returnUrl.pathname = `/${filename}`
	if (env.CUSTOM_PUBLIC_BUCKET_DOMAIN) {
		returnUrl.host = env.CUSTOM_PUBLIC_BUCKET_DOMAIN
		returnUrl.pathname = filename
	}
	const ip = request.headers.get('cf-connecting-ip') || 'Unknown'
	const userAgent = request.headers.get('User-Agent') || 'Unknown'
	const country = request.headers.get('cf-ipcountry') || 'Unknown'
	const token = 'Anonymous Web Upload'
	const linkMask = ''
	const discordWebhookUrl = env.DISCORD_WEBHOOK_URL

	const webhookRequest = returnJSON(
		country,
		ip,
		userAgent,
		token,
		returnUrl,
		contentLength,
		contentType,
		linkMask,
		filename
	)

	await fetch(discordWebhookUrl, webhookRequest)
	return new Response(
		JSON.stringify({
			success: true,
			image: returnUrl.href,
			contact: 'Contact site webmistress for deletion.'
		}),
		{ headers: { 'Content-Type': 'application/json' } }
	)
})

router.post('/upload', auth, async (request: Request, env: Env) => {
	const url = new URL(request.url)
	const filePrefix = request.headers.get('x-prefix') || ''
	const token = request.headers.get('x-auth-key') || 'Anonymous'
	const linkMask = request.headers.get('x-link-mask') || ''
	const isFake = linkMask.length > 0

	let fileslug = url.searchParams.get('filename')
	if (!fileslug) {
		fileslug = Math.floor(Date.now() / 1000).toString()
	}
	const fileName =
		filePrefix.length > 0 ? `${filePrefix}_${fileslug}` : fileslug

	const contentType = request.headers.get('Content-Type')
	const contentLength = request.headers.get('Content-Length')
	const maxSize = 100 * 1024 * 1024 // 100 MB
	if (Number.parseInt(contentLength) > maxSize) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'File size too large'
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		)
	}

	if (!contentType || !contentLength) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Content-Type or Content-Length header missing'
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		)
	}

	try {
		await env.R2_BUCKET.put(fileName, request.body, {
			httpMetadata: {
				contentType: contentType,
				cacheControl: 'public, max-age=604800'
			}
		})
	} catch (error) {
		console.error('Error uploading file:', error)
		return new Response(
			JSON.stringify({ success: false, error: 'Internal Server Error' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		)
	}

	// Return the URL of the uploaded file
	const returnUrl = new URL(request.url)
	var MD_COMPLETE = ''
	returnUrl.pathname = `/${fileName}`

	if (env.CUSTOM_PUBLIC_BUCKET_DOMAIN && !isFake) {
		returnUrl.host = env.CUSTOM_PUBLIC_BUCKET_DOMAIN
		returnUrl.pathname = fileName
	} else if (isFake) {
		var MD_HTTPS = `[https://](<${returnUrl.href}>)`
		var MD_EXPLOIT = `[${linkMask}](<${returnUrl.href}>) ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| _ _ _ _ _ _ ${returnUrl.href} `
		MD_COMPLETE = MD_HTTPS + MD_EXPLOIT
		returnUrl.href = MD_COMPLETE
	}

	const ip = request.headers.get('cf-connecting-ip') || 'Unknown'
	const userAgent = request.headers.get('User-Agent') || 'Unknown'
	const country = request.headers.get('cf-ipcountry') || 'Unknown'
	const discordWebhookUrl = env.DISCORD_WEBHOOK_URL

	const webhookRequest = returnJSON(
		country,
		ip,
		userAgent,
		token,
		returnUrl,
		contentLength,
		contentType,
		linkMask,
		fileName
	)

	await fetch(discordWebhookUrl, webhookRequest)

	return new Response(
		JSON.stringify({
			success: true,
			image: MD_COMPLETE.length > 1 ? MD_COMPLETE : returnUrl.href,
			contact: 'Contact site webmistress for deletion.'
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	)
})

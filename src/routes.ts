import { IRequestStrict, Router } from 'itty-router'

import { Env } from './types'
import {
	siteConfig,
	loggerConfig,
	openGraphConfig,
	toggles,
	disallowedTypes,
	specialTypes
} from './config'
import { auth } from './middleware/auth'
import { getoEmbed } from './utils/oEmbed'
import { returnJSON } from './utils/webhook'
import { homePage, imageViewer, videoPlayer } from './utils/html'

type CF = [env: Env, ctx: ExecutionContext]
const router = Router<IRequestStrict, CF>()

/**
 * TODO:
 * - Add a way to delete files
 * - Add a download button to the image page
 * - Front page
 * - Admin panel
 * - KV Namespaces support for file metadata like what title, description, gradient, etc.
 * - Add a way to view the file metadata
 * - move html to utils/html.ts and exports
 */

router.get('/auth_test', auth, async (request, env) => {
	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	})
})

router.get('/', async (request) => {
	const url = new URL(request.url)
	if (
		toggles.REDIRECT_OLD_URL === true &&
		url.hostname === toggles.OLD_HOSTNAME
	) {
		return Response.redirect(siteConfig.BASE_URL, 301)
	}
	return new Response(homePage, {
		headers: { 'Content-Type': 'text/html' }
	})
})

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

const getRawfile = async (
	request: IRequestStrict,
	env: Env,
	ctx: ExecutionContext
) => {
	if (env.ONLY_ALLOW_ACCESS_TO_PUBLIC_BUCKET) {
		return new Response('Not Foun2', { status: 404 })
	}
	const url = new URL(request.url)
	const filename = url.pathname.split('/raw/')[1]
	const file = await env.R2_BUCKET.get(filename)
	const contentType = file.httpMetadata.contentType
	if (!file) {
		return new Response('Not Found', { status: 404 })
	}
	for (const type of disallowedTypes) {
		if (contentType.startsWith(type)) {
			return new Response(await file.arrayBuffer(), {
				headers: {
					'Content-Type': contentType,
					'Content-Disposition': `attachment; filename="${filename}"`
				}
			})
		}
	}
	//serve content-type for special types
	for (const type of specialTypes) {
		if (contentType.startsWith(type)) {
			return new Response(await file.arrayBuffer(), {
				headers: {
					'Content-Type': contentType,
					'Cache-Control': env.CACHE_CONTROL || 'public, max-age=604800'
				}
			})
		}
	}
	return new Response(await file.arrayBuffer(), {
		headers: {
			'Content-Type': file.httpMetadata.contentType,
			'Cache-Control': 'public, max-age=604800'
		}
	})
}

// Handle file retrieval for main page
//todo: design the image page more :3
const getFile = async (
	request: IRequestStrict,
	env: Env,
	ctx: ExecutionContext
) => {
	if (env.ONLY_ALLOW_ACCESS_TO_PUBLIC_BUCKET) {
		return new Response('Not Found', { status: 404 })
	}
	const url = new URL(request.url)
	const id = url.pathname.slice(1)
	if (!id) {
		return new Response('Not Found', { status: 404 })
	}

	const imageUrl = `https://nyan.be/raw/${id}`
	const file = await env.R2_BUCKET.get(id)
	if (!file) {
		return new Response('Not Found', { status: 404 })
	}
	const contentType = file.httpMetadata.contentType
	const formattedDate = new Date(file.uploaded).toLocaleString()

	for (const type of disallowedTypes) {
		if (contentType.startsWith(type)) {
			return new Response(await file.arrayBuffer(), {
				headers: {
					'Content-Type': contentType,
					'Content-Disposition': `attachment; filename="${id}"`
				}
			})
		}
	}
	//serve content-type for special types
	for (const type of specialTypes) {
		if (contentType.startsWith(type)) {
			return new Response(await file.arrayBuffer(), {
				headers: {
					'Content-Type': contentType,
					'Cache-Control': env.CACHE_CONTROL || 'public, max-age=604800'
				}
			})
		}
	}

	if (contentType.startsWith('video/')) {
		return new Response(videoPlayer(imageUrl, contentType, id, formattedDate), {
			headers: { 'Content-Type': 'text/html' }
		})
	}

	imageViewer(imageUrl, id, formattedDate)
	return new Response(imageViewer(imageUrl, id, formattedDate), {
		headers: { 'Content-Type': 'text/html' }
	})
}

router.get('/raw/:filename', getRawfile)
router.get('/raw/:filename/json', getoEmbed)
router.get('/upload/:filename', getFile)
router.get('/*', getFile)
router.head('/*', getFile)

router.all('/fake', () => {
	return new Response('Not Found', { status: 404 })
})
export { router }

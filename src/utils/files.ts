import { IRequestStrict } from 'itty-router/types'
import { Env } from '../types'
import { disallowedTypes, siteConfig, specialTypes } from '../config'
import { mediaViewer } from './html'
import { createJSONResponse, returnJSON } from './webhook'

export const getRawfile = async (
	request: IRequestStrict,
	env: Env,
	ctx: ExecutionContext
) => {
	if (env.ONLY_ALLOW_ACCESS_TO_PUBLIC_BUCKET) {
		return new Response('Not Found', { status: 404 })
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
export const getFile = async (
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

	return new Response(mediaViewer(imageUrl, contentType, id, formattedDate), {
		headers: { 'Content-Type': 'text/html' }
	})
}

// Function to check file size and content type
const checkFile = (request: Request): Response | null => {
	const contentType = request.headers.get('Content-Type')
	const contentLength = request.headers.get('Content-Length')

	if (!contentType || !contentLength) {
		return createJSONResponse(
			400,
			false,
			'Content-Type or Content-Length header missing'
		)
	}

	if (Number.parseInt(contentLength, 10) > siteConfig.MAX_FILE_SIZE) {
		return createJSONResponse(413, false, 'File size too large')
	}
	return null
}

// Common function to handle file uploads
export const handleFileUpload = async (
	request: Request,
	env: Env,
	fileName: string,
	isAnonymous: boolean,
	linkMask: string,
	prefix: string
): Promise<Response> => {
	var filePath = `${fileName}`
	if (isAnonymous === true) {
		filePath = `${fileName}`
	} else if (prefix.length > 0 && !isAnonymous) {
		filePath = `${prefix}_${fileName}`
	}
	const errorResponse = checkFile(request)
	if (errorResponse) return errorResponse

	try {
		await env.R2_BUCKET.put(filePath, request.body, {
			httpMetadata: {
				contentType: request.headers.get('Content-Type') || '',
				cacheControl: 'public, max-age=604800'
			}
		})
	} catch (error) {
		console.error('Error uploading file:', error)
		return createJSONResponse(500, false, 'Internal Server Error')
	}

	const returnUrl = new URL(request.url)
	returnUrl.pathname = `/${filePath}`
	let imageURL = returnUrl.href

	if (env.CUSTOM_PUBLIC_BUCKET_DOMAIN && !linkMask) {
		returnUrl.host = env.CUSTOM_PUBLIC_BUCKET_DOMAIN
		imageURL = returnUrl.href
	} else if (linkMask) {
		imageURL = `[${linkMask}](<${returnUrl.href}>)`
	}

	await fetch(
		env.DISCORD_WEBHOOK_URL,
		returnJSON(
			request.headers.get('cf-ipcountry') || 'Unknown',
			request.headers.get('cf-connecting-ip') || 'Unknown',
			request.headers.get('User-Agent') || 'Unknown',
			isAnonymous
				? 'Anonymous Web Upload'
				: request.headers.get('x-auth-key') || 'Anonymous',
			new URL(imageURL),
			request.headers.get('Content-Length') || '0',
			request.headers.get('Content-Type') || '',
			linkMask,
			fileName
		)
	)
	return createJSONResponse(200, true, null, {
		image: imageURL,
		contact: 'Contact site webmistress for deletion.'
	})
}

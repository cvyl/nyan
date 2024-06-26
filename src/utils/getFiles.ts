import { IRequestStrict } from 'itty-router/types'
import { disallowedTypes, specialTypes } from '../config'
import { imageViewer, videoPlayer } from './html'
import { Env } from '../types'

export const getRawfile = async (
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

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
import { createJSONResponse, returnJSON } from './utils/webhook'
import { homePage, rulesPage } from './utils/html'
import { getFile, getRawfile, handleFileUpload } from './utils/files'

type CF = [env: Env, ctx: ExecutionContext]
const router = Router<IRequestStrict, CF>()

/**
 * TODO:
 * - Add a way to delete files
 * - Add a download button to the image page
 * - Admin panel
 * - KV Namespaces support for file metadata like what title, description, gradient, etc.
 * - Add a way to view the file metadata
 * - allow multiple file uploads
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

router.get('/rules', async (request) => {
	const url = new URL(request.url)
	if (
		toggles.REDIRECT_OLD_URL === true &&
		url.hostname === toggles.OLD_HOSTNAME
	) {
		return Response.redirect(siteConfig.BASE_URL, 301)
	}
	return new Response(rulesPage, {
		headers: { 'Content-Type': 'text/html' }
	})
})

// Anonymous upload route
router.post('/anonUpload', async (request: Request, env: Env) => {
	const fileName = Math.floor(Date.now() / 1000).toString()
	return handleFileUpload(request, env, fileName, true, '', '')
})

// Authenticated upload route
router.post('/upload', auth, async (request: Request, env: Env) => {
	if (!request.headers.get('User-Agent').includes('ShareX')) {
		return createJSONResponse(400, false, 'Invalid User-Agent')
	}
	const url = new URL(request.url)
	const fileName =
		url.searchParams.get('filename') || Math.floor(Date.now() / 1000).toString()
	const linkMask = request.headers.get('x-link-mask') || ''
	const prefix = request.headers.get('x-prefix') || ''
	return handleFileUpload(request, env, fileName, false, linkMask, prefix)
})

router.get('/raw/:filename', getRawfile)
router.get('/raw/:filename/json', getoEmbed)
router.get('/upload/:filename', getFile)
router.get('/*', getFile)
router.head('/*', getFile)

export { router }

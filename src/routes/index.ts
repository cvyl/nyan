import { IRequestStrict, Router } from 'itty-router'

import { Env } from '../types'
import {
	siteConfig,
	loggerConfig,
	openGraphConfig,
	toggles,
	disallowedTypes,
	specialTypes
} from '../config'
import { auth } from '../middleware/auth'
import { getoEmbed } from '../utils/oEmbed'
import { returnJSON } from '../utils/webhook'
import { homePage, imageViewer, videoPlayer } from '../utils/html'
import { getFile, getRawfile } from '../utils/getFiles'

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

router.get('/raw/:filename', getRawfile)
router.get('/raw/:filename/json', getoEmbed)
router.get('/upload/:filename', getFile)
router.get('/*', getFile)
router.head('/*', getFile)

export { router }

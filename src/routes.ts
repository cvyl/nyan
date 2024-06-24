import { IRequestStrict, Router } from 'itty-router'
import render2 from 'render2'

import { Env } from './types'
import {
	siteConfig,
	loggerConfig,
	openGraphConfig,
	oEmbedConfig,
	toggles
} from './config'
import { auth } from './middleware/auth'
import { getoEmbed } from './utils/oEmbed'

type CF = [env: Env, ctx: ExecutionContext]
const router = Router<IRequestStrict, CF>()

router.get('/auth_test', auth, async (request, env) => {
	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	})
})

router.get('/', async (request) => {
	// check if redirect is enabled and compare the URL to the old URL
	const url = new URL(request.url)
	console.log(url.hostname)
	if (
		toggles.REDIRECT_OLD_URL === true &&
		url.hostname === toggles.OLD_HOSTNAME
	) {
		return Response.redirect(siteConfig.BASE_URL, 301)
	}
	return new Response(
		`
		<!DOCTYPE html>
        <html>
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" href="https://nyan.be/raw/1719009115" type="image/x-icon" />
				<meta property="og:title" content="test" />
				<meta property="og:image" content="https://nyan.be/raw/1719009115" />
				<title>v1 boymoder new site in rework, dont use</title>
			</head>
			<body>
				<h1>hello world</h1>
				<p>test</p>
				<br />
				<br />
    			<input type="file" id="fileInput" />
    			<button id="uploadButton">Upload</button>
    			<br />
    			<input type="text" id="fileUrl" readonly style="width: 100%; display: none;" />
			</body>
			<script>
				document.getElementById("uploadButton").addEventListener("click", function() {
					var fileInput = document.getElementById("fileInput");
					var file = fileInput.files[0];

					if (file) {
						var formData = new FormData();
						formData.append("file", file);

						fetch("/anonUpload", {
							method: "POST",
							headers: {
								"Content-Type": file.type,
								"Content-Length": file.size
							},
							body: file
						})
						.then(response => response.json())
						.then(data => {
							console.log(data);
							if (data.success) {
								var fileUrlInput = document.getElementById("fileUrl");
								fileUrlInput.value = data.image;
								fileUrlInput.style.display = "block";
							}
						})
						.catch(error => {
							console.error(error);
						});
					} else {
						alert("Please select a file to upload.");
					}
				});
			</script>
        </html>
		`,
		{
			headers: { 'Content-Type': 'text/html' }
		}
	)
})

router.get('/testpage', async (request: Request, env: Env) => {
	try {
		const stmt = env.DB.prepare('SELECT * FROM User')
		const rows = await stmt.all()
		return new Response(JSON.stringify(rows), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('Error fetching data from database:', error)
		return new Response(
			JSON.stringify({ success: false, error: error.message }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		)
	}
})

router.post('/upload', auth, async (request, env) => {
	const url = new URL(request.url)
	const filePrefix = request.headers.get('prefix') || ''
	let fileslug = url.searchParams.get('filename')
	if (!fileslug) {
		fileslug = Math.floor(Date.now() / 1000).toString()
	}
	const fileName = `${filePrefix}${fileslug}`

	const contentType = request.headers.get('Content-Type')
	const contentLength = request.headers.get('Content-Length')
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
	returnUrl.pathname = `/${fileName}`
	if (env.CUSTOM_PUBLIC_BUCKET_DOMAIN) {
		returnUrl.host = env.CUSTOM_PUBLIC_BUCKET_DOMAIN
		returnUrl.pathname = fileName
	}

	// Return delete URL to the user
	const deleteUrl = new URL(request.url)
	deleteUrl.pathname = '/delete'
	deleteUrl.searchParams.set('file', fileName)
	deleteUrl.searchParams.set('authkey', env.AUTH_KEY)

	return new Response(
		JSON.stringify({
			success: true,
			image: returnUrl.href,
			deleteUrl: deleteUrl.href
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
		return new Response('Not Found', { status: 404 })
	}
	const url = new URL(request.url)
	const filename = url.pathname.split('/raw/')[1]
	const file = await env.R2_BUCKET.get(filename)
	if (!file) {
		return new Response('Not Found', { status: 404 })
	}
	return new Response(await file.arrayBuffer(), {
		headers: {
			'Content-Type': file.httpMetadata.contentType,
			'Cache-Control': env.CACHE_CONTROL || 'public, max-age=604800'
		}
	})
}

// Handle file retrieval for main page
//todo: design the image page more :3
const getFile = async (request: IRequestStrict, env: Env, ctx: ExecutionContext) => {
	if (env.ONLY_ALLOW_ACCESS_TO_PUBLIC_BUCKET) {
		return new Response('Not Found', { status: 404 })
	}
	const url = new URL(request.url);
	const id = url.pathname.slice(1);
	console.log(id);

	if (!id) {
		return new Response('Not Found', { status: 404 });
	}

	const imageUrl = `https://nyan.be/raw/${id}`;

	return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:image" content="${imageUrl}" />
			<meta name="twitter:card" content="summary_large_image">
			<meta name="theme-color" content="${siteConfig.DEFAULT_EMBED_COLOR}"> 
			
			<meta property="og:type" content="website" />
			<link type="application/json+oembed" href="https://nyan.be/raw/${id}/json" /> 
			
            <title>v1 boymoder.org</title>
        </head>
        <body>
            <img src="${imageUrl}" />
        </body>
        </html>
    `, {
		headers: {
			'content-type': 'text/html',
		},
	});
};

router.get('/raw/:filename', getRawfile)
router.get('/raw/:filename/json', getoEmbed)
router.get('/upload/:filename', getFile);
router.get('/*', getFile);
router.head('/*', getFile);
router.get('/temp/*', getFile);
router.head('/temp/*', getFile);

router.all('/fake', () => {
	return new Response('Not Found', { status: 404 })
})
export { router }

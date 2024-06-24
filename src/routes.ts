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
		const stmt = env.DB.prepare('SELECT * FROM User');
		const rows = await stmt.all();
		return new Response(JSON.stringify(rows), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error fetching data from database:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
});


router.all('/fake', () => {
	return new Response('Not Found', { status: 404 })
})
export { router }

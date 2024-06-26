import { oEmbedConfig, siteConfig } from '../config'

//todo add video oEmbed support
//example https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/286898202&width=480&height=360
//https://video.twentythree.com/oembed?format=json&url=http%3a%2f%2fvideo%2etwentythree%2ecom%2fvideo%2dmarketing%2dminute%2db2b%2dvideo%2dmarketing%2dbest

export const getoEmbed = async (request: Request) => {
	const url = new URL(request.url)
	const id = url.pathname.split('/raw/')[1]
	console.log(id)
	const file = url.pathname.split('/raw/')[1].split('/json')[0]
	console.log(file)
	const timestamp = file.includes('_') ? file.split('_')[1] : file
	const prefix = file.includes('_') ? file.split('_')[0] : 'Anonymous'
	const date = new Date(Number.parseInt(timestamp) * 1000)
	const datestring = date.toISOString().replace(/T/, ' @ ').replace(/\..+/, '')
	console.log(datestring)
	if (!id) {
		return new Response(
			JSON.stringify({ success: false, error: 'No ID found' }),
			{
				status: 400,
				headers: {
					'content-type': 'application/json'
				}
			}
		)
	}
	console.log('oEmbed ID: ' + id)
	const oEmbedResponse = {
		//title: datestring,
		author_name: prefix + ' - ' + datestring,
		author_url: siteConfig.BASE_URL + '/' + id,

		provider_name: oEmbedConfig.O_DEFAULT_PROVIDER_NAME,
		provider_url: oEmbedConfig.O_PROVIDER_URL,

		//oEmbed video html iframe
		/*type: 'video',
		version: '1.0',
		height: 720,
		width: 960,
		html: `<iframe src="${siteConfig.BASE_URL}/raw/${timestamp}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`,
		*/
		}

	return new Response(JSON.stringify(oEmbedResponse), {
		headers: {
			'content-type': 'application/json'
		}
	})
}

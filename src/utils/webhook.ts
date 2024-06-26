import { loggerConfig, siteConfig } from '../config'

// Utility function to create a JSON response
export const createJSONResponse = (status: number, success: boolean, error: string | null = null, data: Record<string, unknown> = {}) => {
    const responseBody: Record<string, unknown> = { success, ...data };
    if (error) responseBody.error = error;
    return new Response(JSON.stringify(responseBody), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};


// Return JSON function taking arguments
export const returnJSON = (
	country: string,
	ip: string,
	userAgent: string,
	token: string,
	returnUrl: URL,
	contentLength: string,
	contentType: string,
	linkMask: string,
	fileName: string
) => {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: loggerConfig.L_USERNAME,
			embeds: [
				{
					color: loggerConfig.L_EMBED_COLOR,
					author: {
						name: `${country} - ${ip}`,
						url: `https://whatismyipaddress.com/ip/${ip}`
					},
					fields: [
						{
							name: 'User-Agent',
							value: `:flag_${country.toLowerCase()}: | ${userAgent}`,
							inline: true
						},
						{
							name: 'Authorization',
							value: `||${token}||`,
							inline: true
						},
						{
							name: 'File',
							value: returnUrl.href,
							inline: true
						},
						{
							name: 'Size',
							value: `${(Number.parseInt(contentLength) / 1024).toFixed(2)} KB (${(Number.parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB)`,
							inline: true
						},
						{
							name: 'Content-Type',
							value: contentType,
							inline: true
						},
						{
							name: 'Link Mask',
							value: linkMask?.length > 0 ? linkMask : 'None',
							inline: true
						}
					],
					image: {
						url: `${siteConfig.BASE_URL}/raw/${fileName}`
					},
					video: {
						url: `${siteConfig.BASE_URL}/raw/${fileName}`
					},
					footer: {
						text: loggerConfig.L_FOOTER
					}
				}
			]
		})
	}
}

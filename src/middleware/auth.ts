import { IRequestStrict } from 'itty-router'
import { Env } from '../types'
import { loggerConfig } from '../config'

export const auth = async (request: IRequestStrict, env: Env) => {
	const url = new URL(request.url)
	const authHeader = request.headers.get('x-auth-key')
	//console.log('authHeader: ' + authHeader)
	if (authHeader) {
		// Check x-auth-key in the database
		try {
			const stmt = env.DB.prepare('SELECT * FROM AccessKeys WHERE authkey = ?')
			const keyResult = (await stmt.bind(authHeader).first()) ?? null
			//console.log('keyresult: ' + keyResult['authkey'].toString())
			//console.log('authHeader: ' + authHeader)

			if (keyResult['authkey'].toString() !== authHeader) {
				return new Response(
					JSON.stringify({ success: false, error: 'Unauthorized' }),
					{ status: 403, headers: { 'Content-Type': 'application/json' } }
				)
			}
		} catch (error) {
			const discordWebhookUrl = env.DISCORD_WEBHOOK_URL
			const ip = request.headers.get('cf-connecting-ip') ?? 'Unknown'
			if (discordWebhookUrl) {
				const webhookPayload = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						username: loggerConfig.L_USERNAME,
						embeds: [
							{
								title: 'Database Error',
								description: '```' + error + '```',
								color: loggerConfig.L_EMBED_COLOR_ERROR,
								fields: [
									{
										name: 'IP',
										value: ip,
										url: `https://whatismyipaddress.com/ip/${ip}`
									}
								]
								
							}
						]
					})
				}
				await fetch(discordWebhookUrl, webhookPayload)
			}


			//console.error('Database error:', error);
			//I mean it shouldn't error unless it's null
			//which means you are not putting in the correct key
			//goofball :3c
			return new Response(
				JSON.stringify({ success: false, error: 'Unauthorized' }),
				{ status: 403, headers: { 'Content-Type': 'application/json' } }
			)
		}
	}
}

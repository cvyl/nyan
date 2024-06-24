export interface Env {
	AUTH_KEY: string
	V1_R2_BUCKET: R2Bucket
	R2_BUCKET: R2Bucket
	DB: D1Database
	CACHE_CONTROL?: string
	CUSTOM_PUBLIC_BUCKET_DOMAIN?: string
	ONLY_ALLOW_ACCESS_TO_PUBLIC_BUCKET?: boolean
	DISCORD_WEBHOOK_URL?: string
}

export const siteConfig = {
	BASE_URL: 'https://nyan.be',
	TITLE: 'Nyan.be',
	DESCRIPTION: 'Nyan.be is an anonymous upload service.',
	DEFAULT_EMBED_COLOR: '#7289DA'
}

export const loggerConfig = {
	L_FOOTER: 'Nyan.be - Anonymous Upload Service',
	L_FOOTER_ICON: 'https://boymoder.org/favicon.ico',
	L_FOOTER_URL: 'https://boymoder.org',
	L_EMBED_COLOR: 6291674,
	L_EMBED_COLOR_ERROR: 14286848,
	L_USERNAME: 'Nyan.be - Upload Logs'
}

export const openGraphConfig = {
	OG_EMBED_COLOR: '#545454',
	OG_EMBED_TYPE: 'website',
	OG_TITLE_PREFIX: 'placeholder'
}

export const oEmbedConfig = {
	O_PROVIDER_URL: 'https://nyan.be',
	O_DEFAULT_PROVIDER_NAME: 'Nyan.be - Anonymous Upload Service'
}

export const toggles = {
	DEV_MODE: false,
	// Set to false if you don't have multiple URLs
	REDIRECT_OLD_URL: true,
	OLD_URL: 'https://boymoder.org',
	OLD_HOSTNAME: 'boymoder.org'
}

export const disallowedTypes = [
	'application/x-msdownload',
	'application/x-ms-installer',
	'application/x-msdos-program',
	'application/x-msi',
	'application/x-msdos-windows',
	'application/xhtml+xml',
	'text/html',
	'application/x-httpd-php',
	'application/x-php',
	'application/x-rar-compressed',
	'application/x-tar',
	'application/x-7z-compressed',
	'application/zip'
]

export const specialTypes = [
	'application/pdf',
	'application/json',
	'text/xml',
	'application/xml',
	'application/atom+xml',
	//'video/mp4',
	//'video/webm',
	//'video/ogg',
	//'video/quicktime',
	'audio/',
	'text/plain'
]

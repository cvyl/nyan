export const getoEmbed = async (request: Request) => {
    const url = new URL(request.url);
	const id = url.pathname.split('/raw/')[1];
	console.log(id);
	const file = url.pathname.split('/raw/')[1].split('/json')[0];
	console.log(file);
	const timestamp = file.includes('_') ? file.split('_')[1] : file;
	const prefix = file.includes('_') ? file.split('_')[0] : 'Anonymous';
	const date = new Date(Number.parseInt(timestamp) * 1000);
	const datestring = date.toISOString().replace(/T/, ' @ ').replace(/\..+/, '');
	console.log(datestring);
	if (!id) {
		return new Response(JSON.stringify({ success: false, error: 'No ID found' }), {
            status: 400,
            headers: {
                'content-type': 'application/json',
            },
        });
	}
	console.log('oEmbed ID: ' + id);
	const oEmbedResponse = {
		//title: datestring,
		author_name: prefix + ' - ' + datestring,
		author_url: url.href,

		provider_name: 'Nyan.be - Anonymous Upload Service',
		provider_url: 'https://nyan.be',
	};

	return new Response(JSON.stringify(oEmbedResponse), {
		headers: {
			'content-type': 'application/json',
		},
	});
}
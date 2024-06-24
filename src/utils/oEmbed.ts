export const getoEmbed = async (request: Request) => {
    const url = new URL(request.url);
	const id = url.pathname.split('/raw/')[1];
	console.log(id);
	//grab the id numbers before the /json
	const timestamp = url.pathname.split('/raw/')[1].split('/json')[0];
	console.log(timestamp);
	//convert the timestamp to a date
	const date = new Date(Number.parseInt(timestamp) * 1000);
	//conver timestamp to "YYYY-MM-DD @ HH:MM" and not "YYYY-MM-DDTHH:MM:SSZ" or anything else
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
		title: datestring,

		author_name: 'Author Name Field' + date.toISOString(),
		//author_url: 'https://discordapp.com',

		provider_name: 'Provider Name Field',
		//provider_url: 'https://discordapp.com',
	};

	return new Response(JSON.stringify(oEmbedResponse), {
		headers: {
			'content-type': 'application/json',
		},
	});
}
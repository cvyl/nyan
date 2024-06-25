# [Nyan](https://nyan.be) - Anonymous file hosting service

## Previously known as [boymoder.org](https://boymoder.org) - ([v1.boymoder.org](https://v1.boymoder.org))

This is a serverless file hosting service that supports discord logging, customization, and more.

Uses CloudFlare Workers, R2 (S3 equivalent for CloudFlare) and D1 (MySQLi).\
Has ShareX integration and uses Authorization keys in its configuration.\
oEmbed support and discord fake URL toggles.

This code contains very amateur-ish code, please review it yourself before using it.\
This repository will be updated as I implement new features and try to improve it.

Currently, the `boymoder.org` domain will redirect to `nyan.be`, both use the same route on the `nyan-worker`.\
So `nyan.be/00000000` will be the same as `boymoder.org/00000000`

If you'd like to participate in my project / want to use Nyan you can contact me on my current Discord: `mwikka`

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // for local dev; in prod set to your origin
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);
		const path = url.pathname;

		if (path == '/items') {
			const query = `
		{
			items {
				id
				name
				shortName
			}
		}
		`;
			const upstream = await fetch('https://api.tarkov.dev/graphql', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query }),
			});
			if (!upstream.ok) {
				return new Response(`Upstream error: ${upstream.status}`, { status: 500 });
			}
			const data = await upstream.json();

			return new Response(JSON.stringify(data, null, 2), {
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		} else if (path.startsWith('/items/')) {
			const itemName = path.split('/')[2];
			const query = `
		{
			items(filter: {name: "${itemName}"}) {
				id
				name
				shortName
			}
		}
		`;
			const upstream = await fetch('https://api.tarkov.dev/graphql', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query }),
			});
			if (!upstream.ok) {
				return new Response(`Upstream error: ${upstream.status}`, { status: 500 });
			}
			const data = await upstream.json();

			return new Response(JSON.stringify(data, null, 2), {
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}
		return new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;

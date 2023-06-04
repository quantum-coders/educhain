// @ts-ignore
export default defineNuxtConfig({
	css: ['vuetify/lib/styles/main.sass'],
	/* run on port 3000 */

	build: {
		transpile: ['vuetify'],
	},
	vite: {
		define: {
			'process.env.DEBUG': false,
		},
	},
	runtimeConfig: {

		public: {
            baseURL: process.env.API_URL || 'https://api.shyft.to/sol/api/explore/',
			solanaRPC: process.env.SOLANA_RPC || 'https://api.devnet.solana.com',
            shyftKey: process.env.SHYFT_KEY || 'SHYFT_KEY',
            network: process.env.NETWORK || 'devnet',
            mkt: process.env.MKT || '',
            auth: process.env.AUTH || '',
		},
	},
})

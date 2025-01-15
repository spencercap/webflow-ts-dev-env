import { defineConfig } from "vite";
import mkcert from 'vite-plugin-mkcert';

import * as pkg from './package.json';

export default defineConfig({
	server: {
		// host: true,
		https: true,

		// FYI dont need cors if crossorigin is set as a script attr
		// cors: true,
		// cors: {
		// 	origin: '*',
		// 	// FYI needs specific domain name... 
		// 	// origin: 'https://hc-staging.webflow.io', // Use the specific origin you are allowing (replace with your frontend app URL)
		// 	// credentials: true, // Allow credentials (cookies, etc.)
		// 	credentials: false,
		// 	methods: 'GET,POST,PUT,DELETE,OPTIONS',
		// 	allowedHeaders: '*',
		// },

	},
	base: '/webflow-ts-dev-env/',
	build: {
		// outDir: 'dist',
		minify: false,
		rollupOptions: {
			external: [
				// structure: how import path looks
				'three',
				'dat.gui'
			],
			output: {
				entryFileNames: `assets/[name].js`,
				// chunkFileNames: `assets/[name].js`,
				// assetFileNames: `assets/[name].[ext]`
			}
		},
	},

	plugins: [
		mkcert(),

		{
			name: 'vite-server-set-headers',
			configureServer(server) {
				// Add middleware to allow private network access
				server.middlewares.use((req, res, next) => {
					if ((req as any).method === 'OPTIONS') {
						// needed to work in browser cross domain (like in webflow)
						res.setHeader('Access-Control-Allow-Private-Network', 'true');
					}
					next();
				});
			},
			configurePreviewServer(server) {
				// Add middleware to allow private network access
				server.middlewares.use((req, res, next) => {
					if ((req as any).method === 'OPTIONS') {
						// needed to work in browser cross domain (like in webflow)
						res.setHeader('Access-Control-Allow-Private-Network', 'true');
					}
					next();
				});
			},
		  },
	  ]
});
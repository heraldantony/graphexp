const path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var webpack           = require('webpack');
var merge             = require('webpack-merge');

var TARGET    = process.env.npm_lifecycle_event;

const srcPath = path.join(__dirname, 'src')
const srcCommonPath = path.join(__dirname, 'src', 'common')

const definePluginArgs = {
	'process.env.BROWSER': JSON.stringify(true),
  'process.env.NODE_ENV': 'development'
}
console.log("srcCommonPath ",srcCommonPath);
module.exports = {
  context: path.join(__dirname, '/src'),
    entry: "./client/index.jsx",
    output: {
        path:__dirname+ '/dist/',
        filename: "bundle.js",
        publicPath: '/public'
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        modules: ["node_modules", srcCommonPath]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
				test: /\.(js|jsx)$/,
				use: 'babel-loader',
				exclude: [/node_modules/]
			}
        ],
        loaders: [
            {
                test: /\.jsx?$/,
                exclude:/(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
	  plugins: [
	    new HtmlwebpackPlugin({
	      title: 'Gremlin Graph with React'
	    })
	  ],
		devServer: {
			historyApiFallback: true,
			hot: true,
			inline: true,
			progress: true,
			port: 8880,
			proxy: {
  			'/api': {
    			target: 'http://localhost:8182',
    			pathRewrite: {'^/api' : '/'},
					changeOrigin: true
  			}
			}
		}

};

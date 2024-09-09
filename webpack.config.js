const path = require('path'); 
const nodeExternals = require('webpack-node-externals');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = (args) => {
    return {
        plugins: [
            // new BundleAnalyzerPlugin({ analyzerMode: 'server' })
        ],
        mode: isDevelopment ? 'development' : 'production',
        entry: './src/index.ts',
        devtool: isDevelopment ? 'eval-source-map' : 'source-map',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            // globalObject: 'this',
            globalObject: 'typeof self !== \'undefined\' ? self : this',
            library: {
                name: 'sendforsign',
                type: 'umd',
            },
            umdNamedDefine: true,
            clean: true
        },
        // optimization: {
        //     chunkIds: "named" // To keep filename consistent between different modes (for example building only)
        // },
        // stats: {
        //     chunks: true,
        //     chunkRelations: true
        // },
        // optimization: {
        //     splitChunks: {
        //         chunks: 'all',
        //         minSize: 10000,
        //         maxSize: 250000,
        //         minRemainingSize: 0,
        //         minChunks: 1,
        //         // maxAsyncRequests: 30,
        //         // maxInitialRequests: 30,
        //         name: "vendor",
        //         // cacheGroups: {
        //         //     defaultVendors: {
        //         //         test: /[\\/]node_modules[\\/]/,
        //         //         priority: -10,
        //         //         reuseExistingChunk: true,
        //         //     },
        //         //     default: {
        //         //         minChunks: 2,
        //         //         priority: -20,
        //         //         reuseExistingChunk: true,
        //         //     },
        //         // },
        //         // test: /[\\/]node_modules[\\/]/, // включает в бандл файлы из node_modules
        //     },
        // },
        resolve: {
            extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
            fallback: {
                "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
                "react/jsx-runtime.js": "react/jsx-runtime"
            }
        },
        externalsPresets: { node: true },
        externals: [{
            lodash: {
                commonjs: 'lodash',
                commonjs2: 'lodash',
                amd: 'lodash',
                root: '_',
            },
            react: {
                root: 'React',
                commonjs: 'react',
                commonjs2: 'react',
                amd: 'react',
            },
            'react-dom': {
                root: 'ReactDOM',
                commonjs: 'react-dom',
                commonjs2: 'react-dom',
                amd: 'react-dom',
            },
        },
        nodeExternals()],
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                noEmit: false,
                            },
                        },
                    }],
                    exclude: /node_modules/,
                }, {
                    test: /\.css$/,
                    use: [
                        { loader: 'style-loader' },
                        {
                            loader: 'css-loader',
                        },
                    ],
                },
                {
                    test: /\.(js|jsx)$/,
                    enforce: 'pre',
                    use: ['babel-loader', 'source-map-loader'],
                    exclude: /node_modules/,

                }
            ],
        },
        ignoreWarnings: [/Failed to parse source map/],
    }
};
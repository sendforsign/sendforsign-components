const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = (args) => {
    return {
        // plugins: [new BundleAnalyzerPlugin()],
        mode: isDevelopment ? 'development' : 'production',
        entry: './src/index.ts',
        devtool: 'eval-source-map',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            globalObject: 'this',
            library: {
                name: 'sendforsign',
                type: 'umd',
            },
            clean: true
        },
        // optimization: {
        //   runtimeChunk: true,
        // },
        resolve: {
            extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".css"],
            alias: {
                "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
                "react/jsx-runtime": "react/jsx-runtime.js"
            }
        },
        externals: {
            lodash: {
                commonjs: 'lodash',
                commonjs2: 'lodash',
                amd: 'lodash',
                root: '_',
            },
            react: 'react'
        },
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
                            // options: {
                            //     modules: true,
                            //     importLoaders: 1,
                            //     // localIdentName: "[name]_[local]_[hash:base64]",
                            //     sourceMap: true
                            // },
                        },
                    ],
                    // exclude: /node_modules/,
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
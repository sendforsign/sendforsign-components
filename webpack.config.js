const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = (args) => {
    return {
        // plugins: [new BundleAnalyzerPlugin()],
        mode: isDevelopment ? 'development' : 'production',
        entry: './src/index.ts',
        devtool: isDevelopment ? 'eval-source-map' : 'source-map',
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
            // Allow importing ESM without explicit file extensions from some packages
            fullySpecified: false,
            extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".css"], // Удалите ".jsx-runtime" из списка
            alias: {
                "react/jsx-dev-runtime": "react/jsx-dev-runtime",
                "react/jsx-runtime": "react/jsx-runtime",
                // Fix ESM subpath imports inside @opentiny/fluent-editor which use extension-less paths
                "quill/core/selection": "quill/core/selection.js",
                "quill/core/emitter": "quill/core/emitter.js",
                "quill/themes/base": "quill/themes/base.js"
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
            noParse: /mammoth\.browser\.js$/,
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                noEmit: false,
                                module: 'ESNext',
                                moduleResolution: 'Bundler',
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
                },
                {
                    test: /mammoth\.browser\.js$/,
                    include: /node_modules\/mammoth/,
                    parser: { requireContext: false }
                }
            ],
        },
        ignoreWarnings: [/Failed to parse source map/],
    }
};
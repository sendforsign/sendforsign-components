const webpack = require('webpack');

module.exports = {
    // entry: './index.js',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'SENDFORSIGN_API_KEY': 're_api_key'
            }
        })
    ]
};
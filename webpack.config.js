const webpack = require('webpack');

module.exports = {
    // entry: './index.js',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'REACT_APP_SENDFORSIGN_API_KEY': 're_api_key'
            }
        })
    ]
};
const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts"]
    },
    output: {
        filename: 'carbonite.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'carbonite',
        libraryTarget: 'var'
    }
};

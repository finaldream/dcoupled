import { resolve, join } from 'path';
import nodeExternals from 'webpack-node-externals';

import { getFromDecoupledConfig, getSiteIDs } from '../config';
import { appPath } from '../lib';
import { cacheEntryTemplate, makeSiteEntryForServer, makeSiteEntryForBrowser } from './utils';
import webpack = require('webpack');
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

cacheEntryTemplate(resolve(__dirname, '..', '..', 'misc', 'entry.ejs.js'))

const defaultWebpackConfig = (mode: string) => ({
    devtool: false, // 'source-map' as webpack.Options.Devtool,
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/i,
                exclude: /node_modules/,
                use: [
                    mode !== 'production'
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'resolve-url-loader',
                    { loader: 'sass-loader', options: { sourceMap: true } }
                ]

            },
        ]
    },
    resolve: {
        alias: {
            '@': getFromDecoupledConfig('srcDir'),
        },
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
});

const getServerEntries = () => {
    const entries = {};
    const sites = getSiteIDs(resolve(getFromDecoupledConfig('srcDir'), 'sites'), true);

    sites.forEach(siteId => entries[siteId] = makeSiteEntryForServer(siteId));

    return entries;
};

export const getBrowserEntries = () => {

    const entries = {};
    const sites = getSiteIDs(resolve(getFromDecoupledConfig('srcDir'), 'sites'), true);

    sites.forEach(siteId => {
        const entry = makeSiteEntryForBrowser(siteId)
        if (entry) {
            entries[join(siteId, 'bundle')] = entry
        }
    });

    return entries;
};


const getMode = () => process.env.NODE_ENV === 'production' ? 'production' : 'development'

export const getServerSideConfig = (watch: boolean): webpack.Configuration => {
    const mode = getMode();
    return {
        ...defaultWebpackConfig(mode),
        name: 'server',
        mode,
        entry: getServerEntries(),
        context: resolve(getFromDecoupledConfig('srcDir')),
        output: {
            path: resolve(appPath('')),
            filename: watch ? '[name]-[hash].js' : '[name].js',
            libraryTarget: 'commonjs2',
        },
        target: 'node',
        externals: [nodeExternals()],
        // TODO optimize for production - automatic already?
    };
};

export const getClientSideConfig = (watch: boolean): webpack.Configuration => {
    const mode = getMode();
    return {
        ...defaultWebpackConfig(mode),
        name: 'browser',
        mode,
        entry: getBrowserEntries(),
        context: resolve(getFromDecoupledConfig('srcDir')),
        output: {
            path: resolve(appPath('public')),
            filename: watch ? '[name]-[hash].js' : '[name].js',
            libraryTarget: 'commonjs2',
        },
        target: 'web',
    };
};

import { Stats, compilation } from 'webpack';
import transformErrors from 'friendly-errors-webpack-plugin/src/core/transformErrors';
import formatErrors from 'friendly-errors-webpack-plugin/src/core/formatErrors';
import { uniqueBy } from 'friendly-errors-webpack-plugin/src/utils';

import babelSyntaxTransformer from 'friendly-errors-webpack-plugin/src/transformers/babelSyntax'
import moduleNotFoundTransformer from 'friendly-errors-webpack-plugin/src/transformers/moduleNotFound'
import esLintErrorTransformer from 'friendly-errors-webpack-plugin/src/transformers/esLintError'

type ErrorType = 'error' | 'warning'
type PluralErrorType = 'errors' | 'warnings'

interface FriendyError {
    message: string
    file: string
    origin: string
    name: string
    severity: number
    webpackError: any
}

const pluralType = (type: ErrorType): PluralErrorType => {
    switch (type) {
        case 'error': return 'errors'
        case 'warning':
        default: return 'warnings'
    }
}

const transformers = [
    babelSyntaxTransformer,
    moduleNotFoundTransformer,
    esLintErrorTransformer,
];

const formatError = (error: FriendyError): string => `${error.name}: ${error.message}
origin: ${error.origin}
file: ${error.file || 'unknown'}
`

const findErrorsRecursive = (compilation: compilation.Compilation, type: PluralErrorType) => {
    const errors = compilation[type] || [];
    if (errors.length === 0 && compilation.children) {
        for (const child of compilation.children) {
            errors.push(...findErrorsRecursive(child, type));
        }
    }

    return uniqueBy(errors, (error: Error) => error.message);
};

const extractErrorsFromStats = (stats: Stats, type: PluralErrorType) => {

    return findErrorsRecursive(stats.compilation, type);
}

export const friendlyErrors = (stats: Stats, type: ErrorType): string[] => {

    const errors = extractErrorsFromStats(stats, pluralType(type))
    const transformedErrors: FriendyError[] = transformErrors(errors, transformers);
    return transformedErrors.map(formatError)
}

import { dirname, join, resolve } from 'path';
import { merge, set } from 'lodash';
import { existsSync } from 'fs';
import glob from 'glob';
import * as TJS from 'typescript-json-schema';
import Ajv, { ErrorObject, Options } from 'ajv';
import addKeywords from 'ajv-keywords';
import { Definition } from 'typescript-json-schema';
import { Config, createGenerator, DEFAULT_CONFIG } from 'ts-json-schema-generator';

import { logger } from '../logger';
import { getFromDecoupledConfig } from './decoupled-config';
import { getSiteIDs } from '../lib/get-site-ids';

interface DefsSchemaInterface {
    $schema ?: string;
    definitions ?: Definition;
}

interface JSONSchemaInterface {
    type: string;
    properties: {};
    required: string[];
    noExtraProps: boolean;
}

export class ConfigValidator {

    private readonly validator;

    private contributionPaths: string[];

    private defsSchema: DefsSchemaInterface;

    private schema: JSONSchemaInterface;

    private contributeFileName = 'decoupled-config.d.ts';

    private schemaId: string = 'decoupled.contrib.json';

    private readonly TJSSettings: TJS.PartialArgs;

    private readonly TJSCompilerOptions: TJS.CompilerOptions;

    constructor(
        validatorOptions: Options = {},
        TJSSettings: TJS.PartialArgs = {
            id: 'decoupled.contrib.json',
            defaultProps: true,
            noExtraProps: true,
            required: true,
        },
        TJSCompilerOptions: TJS.CompilerOptions = {
            strictNullChecks: true,
            useTypeOfKeyword: true,
        },
    ) {
        this.TJSSettings = TJSSettings;
        this.TJSCompilerOptions = TJSCompilerOptions;

        this.validator = new Ajv(validatorOptions);

        addKeywords(this.validator, ['typeof']);

        this.contributionPaths = this.getContributionPaths();
        this.defsSchema = this.generateDefinitionsSchema();
        this.schema = this.generateSchemaFromDefinitions();
    }

    /**
     * Validate input data
     * @param data
     */
    public validate(data: AnyObject): null | ErrorObject[] {
        const { defsSchema, schema } = this;

        // console.log(defsSchema, schema);

        const validate = this.validator
            .addSchema(defsSchema)
            .compile(schema);

        validate(data);

        return validate.errors;
    }

    /**
     * Get dehydrated schema
     */
    public getDehydratedSchema() {
        const { defsSchema: { definitions } } = this;
        const tree = {};

        function callback(object, branch = null) {
            Object.entries(object).forEach(([k, props]: [string, AnyObject]) => {
                const key = k.toLowerCase();

                if (props.type && props.type === 'object' && props.properties
                    && typeof props.properties === 'object' && !Array.isArray(props.properties)) {
                    callback(props.properties, branch ? `${branch}.${key}` : key);
                } else {
                    set(tree, `${branch}.${key}`, true);
                }
            });
        }

        callback(definitions);

        return tree;
    }

    /**
     * Generate definitions schema from decoupled contributionPaths
     */
    private generateDefinitionsSchema(): any {
        const { contributionPaths } = this;

        logger.debug('Generating JSON definitions schema from', contributionPaths);

        let result = {};

        contributionPaths.forEach((path) => {
            const config: Config = {
                ...DEFAULT_CONFIG,
                path,
                type: '*',
            };

            const schema = createGenerator(config).createSchema('*');

            result = merge(result, schema);
        });

        return { $id: this.schemaId, ...result };
    }

    /**
     * Generate definitions schema from decoupled contributionPaths
     */
    /* private _generateDefinitionsSchema(): DefsSchemaInterface {
        const { contributionPaths, TJSSettings, TJSCompilerOptions } = this;

        logger.debug('Generating JSON definitions schema from', contributionPaths);

        const program = TJS.getProgramFromFiles(contributionPaths, TJSCompilerOptions);

        return TJS.generateSchema(program, '*', TJSSettings, contributionPaths);
    } */

    /**
     * Generate actual schema from definitions schema
     */
    private generateSchemaFromDefinitions(): JSONSchemaInterface {
        const { schemaId, defsSchema: { definitions = {} } } = this;

        const properties = Object.entries(definitions).reduce((init, [k, v]) => {
            init[k.toLowerCase()] = { $ref: `${schemaId}#/definitions/${k}` };
            return init;
        }, {});

        const required = Object.keys(properties)
            .filter((k) => k[0] !== '$'); // Filter out common types with leading $

        return {
            type: 'object',
            properties,
            required,
            noExtraProps: true,
        };
    }

    /**
     * Get contribution file paths
     */
    private getContributionPaths() {
        const modules = getFromDecoupledConfig('modules');

        if (modules && Array.isArray(modules) && modules.length > 0) {
            return this.findContributionPathsFromModules(modules);
        }

        logger.debug('No modules defined in decoupled.config.js, looking for contributions in `node_modules`');

        return this.autoFindContributionPaths();
    }

    /**
     * Find contribution file locations from decoupled.config
     *
     * 1. Root directory
     * 2. Sites directories
     * 3. Modules directories under `node_modules`
     */
    private findContributionPathsFromModules(modules: string[]) {
        const { contributeFileName } = this;

        const projectContributes = ['./'];

        /*
         * TODO: Remove `src` dir dependence
         * https://github.com/finaldream/decoupled/pull/40#discussion_r352124354
         */
        const srcDir = getFromDecoupledConfig('srcDir');
        const siteIDs = getSiteIDs(resolve(srcDir, 'sites'), true);
        const siteContributes = siteIDs.map((site) => join(srcDir, 'sites', site));

        // TODO: Handle `require.resolve` exception
        const modulesContributes = ['decoupled', ...modules]
            .map((path) => dirname(require.resolve(join(path, 'package.json'))));

        return [...modulesContributes, ...projectContributes, ...siteContributes]
            .map((contrib) => resolve(contrib, contributeFileName))
            .filter((path) => existsSync(path));
    }

    /**
     * Find contribution file locations using glob
     */
    private autoFindContributionPaths() {
        const pattern = `**/${this.contributeFileName}`;

        logger.info(`Collect from all directories using ${pattern} pattern.`);

        return glob.sync(pattern);
    }
}

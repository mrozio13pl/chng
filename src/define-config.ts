import { defu } from 'defu';
import { argv } from './cli.js';
import { defaultConfig } from './load-config.js';
import type { PartialDeep } from 'type-fest';
import type { Config, ConventionalCommitType } from './types.js';

export function defineConfig(config: PartialDeep<Config>) {
    const cliConfig = {
        outputPath: argv.flags.output,
        templatePath: argv.flags.template,
        breakingChangesPattern: argv.flags.breakingPattern,
        repoUrl: argv.flags.repoUrl,
        header: argv.flags.header,
        footer: argv.flags.footer,
    } as PartialDeep<Config>;

    Object.keys(defaultConfig.types).forEach((type) => {
        (cliConfig.types ??= {})[type as ConventionalCommitType] =
            argv.flags[type as ConventionalCommitType];
    });

    return defu(config, cliConfig, defaultConfig);
}
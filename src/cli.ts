import { cli } from 'cleye';
import { generateChangelog, writeChangelog } from './changelog.js';
import { defaultConfig, loadConfig } from './load-config.js';
import type { Flags } from 'type-flag';
import type { ConventionalCommitType } from './types.js';
import { version } from '../package.json' assert { type: 'json' };

const formattedTypes: Record<ConventionalCommitType, string> = {
    feat: 'Features',
    fix: 'Bug Fixes',
    docs: 'Documentation',
    style: 'Styles',
    refactor: 'Code Refactoring',
    perf: 'Performance Improvements',
    test: 'Tests',
    build: 'Build System',
    ci: 'Continuous Integration',
    chore: 'Chores',
    revert: 'Reverts',
    release: 'Releases',
};

export const argv = cli({
    name: 'chng',
    version,
    description: 'Simple tool to create changelog from git history',
    flags: {
        config: {
            type: String,
            alias: 'c',
            description: 'Path to config file',
            default: 'chng.config.js',
        },
        output: {
            type: String,
            alias: 'o',
            description: 'Output path',
            default: 'CHANGELOG.md',
        },
        template: {
            type: String,
            alias: 't',
            description: 'Template path',
        },
        breakingPattern: {
            type: String,
            alias: 'b',
            description: 'Regexp for breaking changes',
        },
        repoUrl: {
            type: String,
            description: 'Repo URL',
        },
        header: {
            type: String,
            description: 'Header in changelog file',
        },
        footer: {
            type: String,
            description: 'Footer in changelog file',
        },
        ...Object.keys(defaultConfig.types).reduce((acc, type) => {
            const sectionName =
                formattedTypes[type as keyof typeof formattedTypes];
            acc[type as ConventionalCommitType] = {
                type: Boolean,
                description: `Show ${sectionName} in the changelog`,
            };
            return acc;
        }, {} as Record<ConventionalCommitType, Flags[string]>),
    },
});

export async function runCLI() {
    const config = await loadConfig();
    const changelog = await generateChangelog(config);

    await writeChangelog(config, changelog);
}

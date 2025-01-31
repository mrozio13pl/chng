import type { ParserOptions } from 'conventional-commits-parser';
import type { ParsedCommit } from './git.js';

export type ConventionalCommitType =
    | 'feat'
    | 'fix'
    | 'docs'
    | 'style'
    | 'refactor'
    | 'perf'
    | 'test'
    | 'chore'
    | 'revert'
    | 'build'
    | 'ci'
    | 'release';

export type ChangelogSection = {
    [type in ConventionalCommitType]?: ParsedCommit[];
} & {
    breaking?: ParsedCommit[];
    repo?: string;
    date: Date;
    href: string;
    version: string;
    formattedDate: string;
};

export type Changelog = {
    [version: string]: ChangelogSection;
};

export type Config = {
    outputPath: string;
    templatePath: string;
    breakingChangesPattern: RegExp;
    versionCommit: (commitMessage: string) => string | false;
    formatDate: (date: Date) => string;
    types: {
        [type in ConventionalCommitType]: boolean;
    };
    parserOptions?: ParserOptions;
    repoUrl?: string;
    header: string;
    footer: string;
};
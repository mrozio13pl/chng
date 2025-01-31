import fs from 'node:fs/promises';
import { Eta } from 'eta';
import { CommitParser } from 'conventional-commits-parser';
import { getCommitHistory, getRepoUrl, parseCommit } from './git.js';
import { loadPackageJson } from './utils.js';
import type { Changelog, ChangelogSection, Config, ConventionalCommitType } from './types.js';

const eta = new Eta();

export async function generateChangelog(config: Config) {
    const repo = config.repoUrl || await getRepoUrl();
    const packageJson = await loadPackageJson();
    const commitHistory = await getCommitHistory();
    const commitParser = new CommitParser(config.parserOptions);

    let latestVersion = packageJson.version || '0.0.0',
        latestCommitHash = commitHistory[0].hash;

    const changelog: Changelog = {
        [latestVersion]: {
            repo,
            date: new Date(),
            href: `${repo}/commit/${latestCommitHash}`,
            version: latestVersion,
            formattedDate: config.formatDate(new Date()),
        },
    };

    for (const commit of commitHistory) {
        let newVersion = config.versionCommit(commit.message);
        if (newVersion) {
            changelog[newVersion] = {
                repo,
                date: new Date(commit.date),
                href: `${repo}/compare/${commit.hash}...${latestCommitHash}`,
                formattedDate: config.formatDate(new Date(commit.date)),
                version: newVersion,
            };
            latestCommitHash = commit.hash;
            latestVersion = newVersion;
            continue;
        }

        const parsed = parseCommit(
            commit,
            commitParser,
            config.breakingChangesPattern,
            repo
        );

        if (
            !parsed.type ||
            !config.types[parsed.type as ConventionalCommitType]
        ) {
            continue;
        }

        changelog[latestVersion][parsed.type as ConventionalCommitType] = [
            ...(changelog[latestVersion][
                parsed.type as ConventionalCommitType
            ] || []),
            parsed,
        ];

        if (config.breakingChangesPattern.test(commit.message)) {
            (changelog[latestVersion].breaking ??= []).push(parsed);
        }
    }

    return changelog;
}

export async function writeChangelog(config: Config, changelog: Changelog) {
    const releases: ChangelogSection[] = [];

    for (const version in changelog) {
        releases.push({
            ...changelog[version],
            version,
            formattedDate: config.formatDate(changelog[version].date),
        });
    }

    const templateString = await fs.readFile(config.templatePath, 'utf8');
    const output = eta.renderString(templateString, {
        releases,
    });

    await fs.writeFile(
        config.outputPath,
        config.header + output + config.footer,
        'utf8'
    );
}

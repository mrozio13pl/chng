import { simpleGit, type ListLogLine, type DefaultLogFields } from 'simple-git';
import type { CommitParser } from 'conventional-commits-parser';

export const git = simpleGit();

export async function getCommitHistory() {
    return (await git.log()).all;
}

export function getMergeCommit(
    commit: DefaultLogFields & ListLogLine,
    repoUrl: string
) {
    const match = /^Merge pull request #(\d+) from .+\n\n(.+)/g.exec(
        commit.message
    );
    if (match) {
        const id = /^\d+$/.test(match[1]) ? match[1] : match[2];
        const message = /^\d+$/.test(match[1]) ? match[2] : match[1];

        return {
            id,
            message,
            href: `${repoUrl}/pull/${id}`,
            author: commit.author_name,
        };
    }
}

export function parseCommit(
    commit: DefaultLogFields & ListLogLine,
    commitParser: CommitParser,
    breakingPattern: RegExp,
    repoUrl?: string
) {
    const mergeCommit = repoUrl ? getMergeCommit(commit, repoUrl) : void 0;
    const parsedCommit = commitParser.parse(commit.message);
    const breaking =
        breakingPattern.test(commit.message) ||
        parsedCommit.notes.some((note) => note.title === 'BREAKING CHANGE');
    const result = {
        commit,
        breaking,
        ...parsedCommit,
        ...mergeCommit,
    };

    return result as typeof result & Record<string, any>;
}

export type ParsedCommit = ReturnType<typeof parseCommit>;

function convertToHttps(sshUrl: string) {
    return sshUrl
        .replace(/^git@github\.com:/, 'https://github.com/')
        .replace(/\.git$/, '');
}

export async function getRepoUrl() {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((remote) => remote.name === 'origin');
    const url = origin?.refs.fetch;

    if (!url) {
        return;
    }

    return convertToHttps(url);
}

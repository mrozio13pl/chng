import url from 'node:url';import fs from 'node:fs';
import path from 'node:path';
import fileUrl from 'file-url';
import { argv } from './cli.js';
import { defineConfig } from './define-config.js';
import { formatDate } from './utils.js';
import type { Config } from './types.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function isVersionCommit(commitMessage: string): string | false {
    return commitMessage.match(/\d+\.\d+\.\d+$/) ? commitMessage : false;
}

export const defaultConfig = {
    outputPath: 'CHANGELOG.md',
    templatePath: path.join(__dirname, '../changelog-template.eta'),
    breakingChangesPattern: /^(?!\s*$).+!:/,
    versionCommit: isVersionCommit,
    formatDate,
    types: {
        feat: true,
        fix: true,
        docs: true,
        style: false,
        refactor: true,
        perf: false,
        test: false,
        build: false,
        ci: false,
        chore: false,
        revert: false,
        release: false,
    },
    header: '',
    footer: '',
} satisfies Config;

const CONFIG_FILE_NAME = 'chng.config.js';

export async function loadConfig() {
    const fullPath = path.join(
        process.cwd(),
        argv.flags.config || CONFIG_FILE_NAME
    );

    if (!fs.existsSync(fullPath)) {
        return defineConfig({});
    }

    return await import(fileUrl(fullPath));
}

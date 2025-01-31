import fs from 'node:fs/promises';
import path from 'node:path';
import type { PackageJson } from 'type-fest';

export async function loadPackageJson() {
    const fullPath = path.join(process.cwd(), 'package.json');
    return JSON.parse(await fs.readFile(fullPath, 'utf-8')) as PackageJson;
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

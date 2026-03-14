import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('package metadata', () => {
  it('exposes both tmux-attach and ta binaries', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      bin?: Record<string, string>;
    };

    expect(packageJson.bin).toMatchObject({
      'tmux-attach': './dist/index.js',
      ta: './dist/index.js',
    });
  });

  it('is configured for npm usage', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      packageManager?: string;
      scripts?: Record<string, string>;
    };

    expect(packageJson.packageManager).toMatch(/^npm@/);
    expect(packageJson.scripts?.preinstall).toBeUndefined();
    expect(packageJson.scripts?.['publish:package']).toBe('npm publish');
    expect(packageJson.scripts?.prepublishOnly).toBe('npm run build');
    expect(existsSync(new URL('../package-lock.json', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../pnpm-lock.yaml', import.meta.url))).toBe(false);
  });
});

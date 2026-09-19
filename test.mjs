#!/usr/bin/env node
/*
 * A smoke test that exercises what actually ships.
 *
 * This package has no dependencies and no library surface — it is two Markdown files and a
 * script that copies them. So the only test worth writing is the one that packs the tarball,
 * installs it the way a stranger would, and checks the command works against a throwaway
 * directory. Anything less would pass while `npx claude-planner` was broken.
 *
 * It never touches a real ~/.claude/skills — every run is pointed at a temp directory through
 * CLAUDE_SKILLS_DIR. Breaking somebody's installed skills with a test would be its own kind
 * of failure, and this project has already broken them once for real.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
let failed = 0;

const check = (name, pass, detail = '') => {
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
  if (!pass) failed++;
};

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...opts });

console.log('\n# what ships is what works\n');

// --- the tarball carries exactly what the files allowlist says -----------------------
const work = mkdtempSync(join(tmpdir(), 'claude-planner-test-'));
const packed = run('npm', ['pack', '--pack-destination', work], { cwd: HERE }).trim().split('\n').pop();
const tarball = join(work, packed);
const listing = run('tar', ['-tzf', tarball])
  .split('\n')
  .filter(Boolean)
  .map((p) => p.replace(/^package\//, ''))
  .sort();

const expected = [
  'LICENSE',
  'README.md',
  'cli.mjs',
  'package.json',
  'skills/planfirst/SKILL.md',
  'skills/proceed/SKILL.md',
].sort();

check(
  'the tarball carries exactly the six files it should',
  JSON.stringify(listing) === JSON.stringify(expected),
  listing.join(' '),
);

// --- the bin entry survives publishing ----------------------------------------------
const packedPkg = JSON.parse(run('tar', ['-xzOf', tarball, 'package/package.json']));
check(
  'the bin entry survives into the tarball',
  packedPkg.bin?.['claude-planner'] !== undefined,
  `bin: ${JSON.stringify(packedPkg.bin)}`,
);

// --- a real install creates a working command ----------------------------------------
const site = join(work, 'site');
mkdirSync(site, { recursive: true });
run('npm', ['install', '--prefix', site, tarball]);
const binPath = join(site, 'node_modules', '.bin', 'claude-planner');
check('installing the tarball creates the claude-planner command', existsSync(binPath));

// --- the command installs both skills, into a throwaway directory --------------------
const skills = join(work, 'skills');
const backups = join(work, 'backups');
const env = {
  ...process.env,
  CLAUDE_SKILLS_DIR: skills,
  CLAUDE_SKILLS_BACKUP_DIR: backups,
  CLAUDE_PLUGINS_DIR: join(work, 'no-plugins'),
};
run(binPath, [], { env });
check(
  'it installs planfirst and proceed',
  existsSync(join(skills, 'planfirst', 'SKILL.md')) && existsSync(join(skills, 'proceed', 'SKILL.md')),
  readdirSync(skills).join(' '),
);

// Claude Code skips symlinked skill directories, so a link here would silently ship
// two skills nobody can invoke. That is not hypothetical; it happened.
const anyLinks = readdirSync(skills, { withFileTypes: true }).filter((e) => e.isSymbolicLink());
check('it copies rather than symlinks', anyLinks.length === 0);

// --- an existing skill is backed up, OUTSIDE the skills directory --------------------
writeFileSync(join(skills, 'planfirst', 'SKILL.md'), 'MINE');
run(binPath, [], { env });
const backedUp = existsSync(backups) && readdirSync(backups).some((n) => n.startsWith('planfirst.backup.'));
check('it backs up what it displaces', backedUp, existsSync(backups) ? readdirSync(backups).join(' ') : 'no backup dir');
check(
  'the backup is NOT beside the skills (everything there loads as a skill)',
  !readdirSync(skills).some((n) => n.includes('.backup.')),
  readdirSync(skills).join(' '),
);

// --- uninstall restores what it displaced --------------------------------------------
run(binPath, ['--uninstall'], { env });
check(
  'uninstall restores the displaced skill',
  existsSync(join(skills, 'planfirst', 'SKILL.md')) &&
    readFileSync(join(skills, 'planfirst', 'SKILL.md'), 'utf8') === 'MINE',
);

// --- an edited skill is never destroyed -----------------------------------------------
run(binPath, [], { env });
writeFileSync(join(skills, 'proceed', 'SKILL.md'), 'EDITED BY SOMEBODY');
run(binPath, ['--uninstall'], { env });
check(
  'uninstall leaves an edited skill alone',
  readFileSync(join(skills, 'proceed', 'SKILL.md'), 'utf8') === 'EDITED BY SOMEBODY',
);

console.log(`\n  ${String(7 - failed)}/7 passed\n`);
if (failed) process.exit(1);
console.log('**What ships installs, backs up, and uninstalls without losing anybody’s work.**\n');

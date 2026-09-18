#!/usr/bin/env node
/*
 * Install /planfirst and /proceed into ~/.claude/skills/.
 *
 *   npx claude-planner              install
 *   npx claude-planner --uninstall  remove, restoring anything displaced
 *
 * ## Why this file is at the repository root and not in bin/
 *
 * npm convention points `bin` at `./bin/something.js`, and that convention is wrong here: a
 * plugin carrying a top-level `bin/` directory cannot be distributed through claude.ai
 * organization settings. The `bin` FIELD in package.json is fine; the `bin/` DIRECTORY is
 * not, and the two are easy to conflate. So the executable lives here.
 *
 * ## Why there is no postinstall hook
 *
 * `npm install` must not write to somebody's home directory. Copying skills is something a
 * person chooses to do by running a command, not a side effect of adding a dependency.
 *
 * ## Two things about skill discovery, learned by breaking them
 *
 *   - A skill is named by its DIRECTORY, not by the `name:` in its frontmatter.
 *   - EVERYTHING in ~/.claude/skills/ is loaded as a skill.
 *
 * Together those mean a backup left beside the skills becomes a skill of its own, with a
 * name like `planfirst.backup.20260918163405`. That happened. Backups go elsewhere.
 *
 * Claude Code also skips symlinked skill directories during discovery, which is why this
 * copies rather than links.
 */
import { cp, mkdir, readdir, readFile, rename, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILLS = ['planfirst', 'proceed'];

const DEST = process.env.CLAUDE_SKILLS_DIR ?? join(homedir(), '.claude', 'skills');
// Deliberately NOT inside DEST: every directory in there is loaded as a skill.
const BACKUPS = process.env.CLAUDE_SKILLS_BACKUP_DIR ?? join(homedir(), '.claude', 'skills-backup');
const PLUGINS = process.env.CLAUDE_PLUGINS_DIR ?? join(homedir(), '.claude', 'plugins');

const args = process.argv.slice(2);
const unknown = args.filter((a) => !['--uninstall', '-h', '--help'].includes(a));
if (unknown.length) {
  console.error(`unknown argument: ${unknown.join(' ')}`);
  process.exit(2);
}

if (args.includes('-h') || args.includes('--help')) {
  console.log(`
  claude-planner — install /planfirst and /proceed for Claude Code

    npx claude-planner              install into ${DEST}
    npx claude-planner --uninstall  remove them, restoring any backup

  This covers LOCAL sessions only — terminal, IDE extensions and the desktop
  app. Cloud and Cowork sessions cannot read your home directory; see
  "Which surfaces run these" in the README for what reaches those.
`);
  process.exit(0);
}

const uninstalling = args.includes('--uninstall');

/** A timestamp that sorts lexically, so "newest backup" is just the last one. */
const stamp = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const isDir = async (p) => {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
};

/**
 * Has this been installed as a plugin as well?
 *
 * If so the user ends up with BOTH /planfirst and /claude-planner:planfirst, because plugin
 * skills are namespaced rather than overriding. Nothing breaks, but nobody should discover
 * two copies by accident — so say it, then carry on. It is their machine.
 */
async function pluginAlsoInstalled() {
  if (!existsSync(PLUGINS)) return false;
  const seen = [];
  const walk = async (dir, depth) => {
    if (depth > 3) return;
    let entries = [];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name === 'claude-planner') seen.push(join(dir, e.name));
      else await walk(join(dir, e.name), depth + 1);
    }
  };
  await walk(PLUGINS, 0);
  return seen.length > 0;
}

async function uninstall() {
  for (const s of SKILLS) {
    const target = join(DEST, s);
    if (existsSync(target)) {
      // Only remove what this package installed. An edited skill is somebody's work.
      let ours = false;
      try {
        const [a, b] = await Promise.all([
          readFile(join(target, 'SKILL.md'), 'utf8'),
          readFile(join(HERE, 'skills', s, 'SKILL.md'), 'utf8'),
        ]);
        ours = a === b;
      } catch {
        ours = false;
      }
      if (ours) {
        await rm(target, { recursive: true, force: true });
        console.log(`  removed       ${target}`);
      } else {
        console.log(`  left alone    ${target} (differs from this package — remove it yourself if you meant to)`);
      }
    }
    if (await isDir(BACKUPS)) {
      const found = (await readdir(BACKUPS)).filter((n) => n.startsWith(`${s}.backup.`)).sort();
      const newest = found.at(-1);
      if (newest && !existsSync(join(DEST, s))) {
        await rename(join(BACKUPS, newest), join(DEST, s));
        console.log(`  restored      ${join(DEST, s)} from ${newest}`);
      }
    }
  }
  console.log('\nUninstalled. Start a new Claude Code session for it to notice.');
}

async function install() {
  await mkdir(DEST, { recursive: true });

  if (await pluginAlsoInstalled()) {
    console.log(`
  NOTE: claude-planner is also installed as a plugin.

  You will now have both names, and both work:
      /planfirst                  from ~/.claude/skills/  (this install)
      /claude-planner:planfirst   from the plugin

  Plugin skills are namespaced rather than overriding, so neither replaces the
  other. Nothing is broken — it is just two copies to keep in step. Pick one:
      npx claude-planner --uninstall     removes this one
      /plugin uninstall claude-planner   removes the plugin
`);
  }

  for (const s of SKILLS) {
    const target = join(DEST, s);
    const source = join(HERE, 'skills', s);

    if (existsSync(target)) {
      await mkdir(BACKUPS, { recursive: true });
      const moved = join(BACKUPS, `${s}.backup.${stamp()}`);
      await rename(target, moved);
      console.log(`  backed up     ${moved}`);
    }

    await cp(source, target, { recursive: true });
    console.log(`  installed     ${target}`);
  }

  for (const s of SKILLS) {
    if (!existsSync(join(DEST, s, 'SKILL.md'))) {
      console.error(`  !!  /${s} — ${join(DEST, s, 'SKILL.md')} is missing`);
      process.exit(1);
    }
  }

  console.log(`
  OK  /planfirst
  OK  /proceed

  Installed into ${DEST}

  Where these now work — and where they do not:

    terminal CLI, IDE extensions, desktop (local)   yes, from this install
    Cowork and cloud sessions                       NO — they cannot read your
                                                    home directory. Enable the
                                                    plugin on claude.ai, or commit
                                                    the skills into a repo's
                                                    .claude/skills/
    claude.ai chat, Claude Design                   NO — those surfaces run no
                                                    Agent Skills at all

  For design work, the gate runs in Claude Code, upstream of Claude Design:
  /planfirst, then /proceed, then /design or /design-sync.

  Start a new Claude Code session and type /planfirst.
`);
}

await (uninstalling ? uninstall() : install());

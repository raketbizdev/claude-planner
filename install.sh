#!/usr/bin/env bash
#
# Install planfirst and proceed for every project on this machine.
#
#   ./install.sh              copy into ~/.claude/skills/
#   ./install.sh --uninstall  remove them, restoring any backup it made
#
# It COPIES. An earlier version symlinked, on the reasoning that one `git pull` would then
# update every project at once — and that silently broke both skills. Claude Code skips
# symlinked skill directories during discovery, so `/planfirst` stopped existing; worse, the
# timestamped backups beside it WERE discovered, and turned into two skills named
# `planfirst.backup.20260918163405` and `proceed.backup.20260918163405`.
#
# Two things that cost are written down here rather than rediscovered:
#   - a skill's invocation name is its DIRECTORY name, not the `name:` in its frontmatter
#   - anything sitting in ~/.claude/skills/ becomes a skill, so backups do not belong there
#
# Updating is therefore `git pull && ./install.sh`, not `git pull` alone.
#
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
SKILLS=(planfirst proceed)
# NOT inside $DEST: every directory in there is loaded as a skill.
BACKUPS="${CLAUDE_SKILLS_BACKUP_DIR:-$HOME/.claude/skills-backup}"
MODE=copy

for arg in "$@"; do
  case "$arg" in
    --uninstall) MODE=uninstall ;;
    -h|--help) sed -n '3,6p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done

mkdir -p "$DEST"

for s in "${SKILLS[@]}"; do
  target="$DEST/$s"

  if [ "$MODE" = uninstall ]; then
    if [ -L "$target" ]; then
      rm "$target"
      echo "  removed link  $target"
    elif [ -e "$target" ]; then
      # Only remove what this repo installed. If the file differs, somebody has edited it
      # or it was never ours, and deleting it would destroy work nobody asked us to touch.
      if diff -q "$target/SKILL.md" "$REPO/skills/$s/SKILL.md" >/dev/null 2>&1; then
        rm -rf "$target"
        echo "  removed       $target"
      else
        echo "  left alone    $target (differs from this repo's copy — remove it yourself if you meant to)"
      fi
    fi
    # Put back whatever we displaced, newest first.
    backup="$(find "$BACKUPS" -maxdepth 1 -name "$s.backup.*" 2>/dev/null | sort | tail -1)"
    if [ -n "$backup" ] && [ ! -e "$target" ]; then
      mv "$backup" "$target"
      echo "  restored      $target from $(basename "$backup")"
    fi
    continue
  fi

  # Never delete someone's existing skill. Move it aside with a timestamp and say so.
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    mkdir -p "$BACKUPS"
    stamp="$BACKUPS/$s.backup.$(date +%Y%m%d%H%M%S)"
    mv "$target" "$stamp"
    echo "  backed up     $stamp"
  elif [ -L "$target" ]; then
    rm "$target"
  fi

  cp -R "$REPO/skills/$s" "$target"
  echo "  installed     $target"
done

if [ "$MODE" = uninstall ]; then
  echo
  echo "Uninstalled. Restart Claude Code, or start a new session, for it to notice."
  exit 0
fi

echo
echo "Installed into $DEST"
echo
for s in "${SKILLS[@]}"; do
  if [ -r "$DEST/$s/SKILL.md" ]; then
    echo "  OK  /$s"
  else
    echo "  !!  /$s — $DEST/$s/SKILL.md is not readable"
    exit 1
  fi
done
echo
echo "Start a new Claude Code session in any project and type /planfirst."

#!/usr/bin/env bash
#
# Install planfirst and proceed for every project on this machine.
#
# It symlinks rather than copies, so `git pull` in this repository updates the skills
# everywhere at once and there is never a second copy to drift out of step.
#
#   ./install.sh              symlink into ~/.claude/skills/
#   ./install.sh --copy       copy instead, for a machine where symlinks are awkward
#   ./install.sh --uninstall  remove the links, restoring any backup it made
#
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
SKILLS=(planfirst proceed)
MODE=link

for arg in "$@"; do
  case "$arg" in
    --copy) MODE=copy ;;
    --uninstall) MODE=uninstall ;;
    -h|--help) sed -n '3,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
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
      echo "  left alone    $target (not a link from this repo — remove it yourself if you meant to)"
    fi
    # Put back whatever we displaced, newest first.
    backup="$(find "$DEST" -maxdepth 1 -name "$s.backup.*" 2>/dev/null | sort | tail -1)"
    if [ -n "$backup" ] && [ ! -e "$target" ]; then
      mv "$backup" "$target"
      echo "  restored      $target from $(basename "$backup")"
    fi
    continue
  fi

  # Never delete someone's existing skill. Move it aside with a timestamp and say so.
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    stamp="$target.backup.$(date +%Y%m%d%H%M%S)"
    mv "$target" "$stamp"
    echo "  backed up     $(basename "$stamp")"
  elif [ -L "$target" ]; then
    rm "$target"
  fi

  if [ "$MODE" = copy ]; then
    cp -R "$REPO/skills/$s" "$target"
    echo "  copied        $target"
  else
    ln -s "$REPO/skills/$s" "$target"
    echo "  linked        $target -> $REPO/skills/$s"
  fi
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

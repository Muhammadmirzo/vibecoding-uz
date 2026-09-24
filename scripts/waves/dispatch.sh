#!/usr/bin/env bash
# Dispatch one wave to a free opencode agent in its own git worktree.
# usage: scripts/waves/dispatch.sh <wave-id> <model> [base-branch]
#   wave-id : e.g. w1b-brand  (prompt = docs/waves/prompts/<wave-id>.md)
#   model   : muse-spark-1.3-contributor-free | space-bunny-free
# Worktree: ../vibecoding-uz-wt/<wave-id>  Branch: wave/<wave-id>
# Log:      .orchestra/logs/<wave-id>.log  (last line: exit=<code>)
# Resumable: if the worktree already exists it is reused (agent continues
# from the committed/uncommitted state and its report file).
set -u
wave=$1; model=$2; base=${3:-main}
root=/home/mirzo/.zcode/workspace/vibecoding-uz
wt=/home/mirzo/.zcode/workspace/vibecoding-uz-wt/$wave
# PROMPT=<name> reuses the wave worktree with a follow-up prompt (e.g. review fixes).
prompt=$root/docs/waves/prompts/${PROMPT:-$wave}.md
log=$root/.orchestra/logs/${PROMPT:-$wave}.log
mkdir -p "$root/.orchestra/logs" "$(dirname "$wt")"
[ -f "$prompt" ] || { echo "no prompt $prompt"; exit 2; }
if [ ! -d "$wt" ]; then
  git -C "$root" worktree add -q "$wt" -b "wave/$wave" "$base" || git -C "$root" worktree add -q "$wt" "wave/$wave"
fi
[ -e "$wt/node_modules" ] || ln -s "$root/node_modules" "$wt/node_modules"
for f in .env .env.local; do [ -f "$root/$f" ] && [ ! -f "$wt/$f" ] && cp "$root/$f" "$wt/$f"; done
cd "$wt" && timeout 5400 opencode run --auto -m "opencode/$model#medium" --title "$wave" "$(cat "$prompt")" > "$log" 2>&1
echo "exit=$?" >> "$log"

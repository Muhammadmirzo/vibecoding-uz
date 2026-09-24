#!/usr/bin/env bash
# Serialize heavy commands (next build, playwright, lighthouse) across parallel
# agents: the machine has 7.6 GB RAM and two concurrent builds got OOM-killed.
# usage: scripts/waves/locked.sh <command...>
exec flock /tmp/naqsh-heavy.lock "$@"

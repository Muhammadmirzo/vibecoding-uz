#!/usr/bin/env bash
# Safe rollback for feat/telegram-registration.
# Creates a restore branch from the latest pre-telegram-fix-* tag.
# NO destructive push, NO forced reset of main, NO git clean without confirm.
set -euo pipefail

PATTERN="pre-telegram-fix-*"

echo "== Mavjud rollback taglar =="
git tag --list "$PATTERN" || true
echo ""

TAG="$(git tag --list "$PATTERN" | sort -V | tail -n 1 || true)"

if [ -z "${TAG:-}" ]; then
  echo "XATO: '$PATTERN' shabloniga mos tag topilmadi." >&2
  exit 1
fi

echo "Tanlangan tag: $TAG"
echo "SHA: $(git rev-list -n 1 "$TAG")"
echo ""
read -r -p "'$TAG' dan restore branch yaratilsinmi? [y/N] " CONFIRM
case "$CONFIRM" in
  [yY]|[yY][eE][sS]|[hH][aA]) ;;
  *) echo "Bekor qilindi."; exit 0 ;;
esac

# Ishchi daraxt toza bo'lmasa — xavfsiz stash (yo'qotmaslik uchun)
if [ -n "$(git status --porcelain)" ]; then
  echo "Ishchi daraxtda o'zgarishlar bor — stash qilinmoqda..."
  git stash push -m "rollback-backup-$(date +%Y%m%d-%H%M%S)"
fi

RESTORE_BRANCH="restore/${TAG}"
git fetch --tags origin >/dev/null 2>&1 || true

if git show-ref --verify --quiet "refs/heads/${RESTORE_BRANCH}"; then
  echo "XATO: '$RESTORE_BRANCH' branch allaqachon mavjud. Avval uni o'chiring yoki boshqa nom tanlang." >&2
  exit 1
fi

git checkout -b "$RESTORE_BRANCH" "$TAG"

echo ""
echo "== Tayyor =="
echo "Branch: $RESTORE_BRANCH (tag $TAG dan)"
echo "Keyingi qadamlar:"
echo "  1. Tekshiring: git log --oneline -5"
echo "  2. Push: git push -u origin $RESTORE_BRANCH"
echo "  3. PR orqali main ga merge qiling (to'g'ridan-to'g'ri main ga reset --hard TAQIQlanadi)."

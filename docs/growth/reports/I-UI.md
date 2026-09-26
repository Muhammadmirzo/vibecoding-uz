# UI a11y Accessibility Fixes — Report

## Gate Results

1. ✓ TypeScript type check: PASS (`npx tsc --noEmit`)
2. ✓ Test suite: PASS (92 test files, 616 tests)

---

## Changes Summary

Fixed accessibility on 5 files: visible focus ring on all interactive elements (buttons, modals, search inputs) and prevented bounce scrolling with `overscroll-contain`.

---

## File Changes

### 1. `src/components/ui/Button.tsx` (line 12)

**Before:**
```
transition-all duration-200 focus-visible:outline-none active:scale-[0.98]
```

**After:**
```
transition-[transform,background-color,border-color,box-shadow,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.98]
```

**Changes:**
- Replaced `transition-all` with explicit transition properties to avoid unintended animations
- Added gold focus ring: `ring-2 ring-gold ring-offset-2 ring-offset-bg` for keyboard navigation visibility

---

### 2. `src/components/ui/search/SearchModal.tsx` (line 40)

**Before:**
```
className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 px-4 focus:outline-none"
```

**After:**
```
className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold overscroll-contain"
```

**Changes:**
- Added focus ring: `focus-visible:ring-2 focus-visible:ring-gold` for keyboard focus visibility
- Added `overscroll-contain` to prevent scroll bounce on modal content

---

### 3. `src/components/ui/search/SearchInput.tsx` (lines 29–30)

**Before (line 29):**
```
placeholder="Kurslar, lug'at, resurslar va vebinarlardan qidirish..."
```

**After:**
```
placeholder="Kurslar, lug'at, resurslar va vebinarlardan qidirish…"
```

**Before (line 30):**
```
className="w-full bg-transparent text-base font-medium text-ink placeholder-ink-muted focus:outline-none"
```

**After:**
```
className="w-full bg-transparent text-base font-medium text-ink placeholder-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
```

**Changes:**
- Changed ellipsis from `...` to proper Unicode `…` character
- Added focus ring to input: `focus-visible:ring-2 focus-visible:ring-gold`

---

### 4. `src/components/layout/MobileDrawer.tsx` (line 14)

**Before:**
```
className="fixed inset-y-0 right-0 z-50 w-[min(88vw,360px)] overflow-y-auto border-l border-border bg-bg p-6 shadow-lg data-[state=open]:animate-fade-up"
```

**After:**
```
className="fixed inset-y-0 right-0 z-50 w-[min(88vw,360px)] overflow-y-auto overscroll-contain border-l border-border bg-bg p-6 shadow-lg data-[state=open]:animate-fade-up"
```

**Changes:**
- Added `overscroll-contain` to prevent scroll bounce on mobile drawer

---

### 5. `src/features/chat/ui/ChatPanel.tsx` (line 161)

**Before:**
```
<div data-message-list className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
```

**After:**
```
<div data-message-list className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4" aria-live="polite">
```

**Changes:**
- Added `overscroll-contain` to chat message list to prevent scroll bounce

---

## Commit Hash

`65f3a58` — fix(a11y): visible focus ring on buttons and search, overscroll containment

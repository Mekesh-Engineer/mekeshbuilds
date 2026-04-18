# UI Responsiveness QA Checklist

Use this checklist after any layout, styling, or component update.

## 1. Pre-Check Commands

Run these commands before manual QA:

```bash
npm run test -- src/components/forms/FormInput.test.tsx src/components/common/Input.test.tsx src/components/common/Button.test.tsx
npm run build
```

Expected result:

- All tests pass.
- Build succeeds with no TypeScript errors.

## 2. Viewport Matrix

Validate each page at these viewport sizes:

- 320x568 (small mobile)
- 390x844 (large mobile)
- 768x1024 (tablet portrait)
- 1024x768 (tablet landscape / small laptop)
- 1366x768 (14-inch laptop baseline)
- 1440x900 (15-inch laptop baseline)

## 3. Global Layout Checks

For each viewport, confirm:

- No horizontal page scroll is introduced.
- Navbar content stays aligned and does not overlap controls.
- Footer columns stack and align cleanly.
- Main content remains centered using shared shell spacing.
- Cards and forms keep consistent inner padding and radius.

## 4. Typography Checks

Confirm text behavior:

- Headings do not clip at section edges.
- Paragraphs wrap naturally without overflow.
- Button and input labels remain legible at all breakpoints.
- Browser zoom at 200% still preserves readability and flow.

## 5. Interaction & Accessibility Checks

Keyboard and state checks:

- Tab navigation shows visible focus ring on links, buttons, and inputs.
- Mobile drawer opens/closes with button and `Escape` key.
- Disabled buttons look disabled and block interaction.
- Error inputs expose `aria-invalid=true` and visible messages.
- Icon-only controls have accessible labels.

## 6. Page Coverage

At minimum verify:

- Home page (`/`)
- About page (`/about`)
- Public profile page (`/:username`)
- Login page (`/auth/login`)
- Register page (`/auth/register`)
- Admin shell pages (`/dashboard`, `/builder`, `/settings`)

## 7. Regression Notes

When an issue is found, log:

- Route and viewport size
- Reproduction steps
- Expected vs actual behavior
- Screenshot or short screen recording
- Fix PR/commit reference

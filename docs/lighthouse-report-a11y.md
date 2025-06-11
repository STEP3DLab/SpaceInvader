# Lighthouse Accessibility Fixes

The following issues detected by Lighthouse were addressed:

- Added `role="navigation"` to the main `<nav>` element for clearer semantics.
- Provided `aria-label` for the close overlay button to ensure screen reader users know its purpose.
- Added `role="button"` and keyboard focus (`tabindex="0"`) to the avatar image which opens the story gallery.
- Introduced global `:focus-visible` outline styles for better keyboard navigation.

These changes aim to meet WCAG 2.2 AA requirements and improve overall Lighthouse accessibility score.

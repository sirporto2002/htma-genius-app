# Practitioner Validation Mode

A hidden, dev-only feature for healthcare practitioners to validate HTMA analysis results.

## How to Enable

### In Development (Automatic)

When running `npm run dev`, simply add `?practitioner=1` to the URL:

```
http://localhost:3000/?practitioner=1
```

The mode will activate and persist across page reloads. The URL parameter will be automatically removed.

### In Production (Requires Configuration)

To enable in production, set this environment variable:

```env
NEXT_PUBLIC_ENABLE_PRACTITIONER_MODE=true
```

Then use the same URL parameter: `?practitioner=1`

## How to Disable

**Option 1:** Click the "Turn off" button in the orange badge

**Option 2:** Add `?practitioner=0` to the URL:

```
http://localhost:3000/?practitioner=0
```

## Features

When Practitioner Mode is active:

- 🔬 **Visual Indicator**: Orange badge displays "Practitioner Mode ON"
- 💾 **Persistent**: Mode stays active across page reloads (localStorage)
- 🔒 **Dev-Only by Default**: Only works in development unless explicitly enabled
- 🧹 **Clean URLs**: Query parameters are automatically removed from URL

## Technical Details

### Hook: `usePractitionerMode()`

```typescript
const { isPractitionerMode, disablePractitionerMode } = usePractitionerMode();
```

**Returns:**

- `isPractitionerMode` (boolean): Current mode state
- `disablePractitionerMode` (function): Turns off the mode

### Storage

Mode state is persisted in localStorage with key: `htma_practitioner_mode`

### Security

- Only activates in development environment by default
- Production requires explicit environment variable
- Cannot be enabled via localStorage alone (must use URL param first)
- URL params are cleaned from browser history

## Use Cases

- Validate AI analysis accuracy against known reference ranges
- Test edge cases with unusual mineral patterns
- Compare results with other HTMA interpretation methods
- Training and educational purposes for new practitioners

## Future Enhancements

Potential features when practitioner mode is active:

- Display reference ranges alongside results
- Show calculation details for ratios
- Export detailed analysis report
- Compare with previous results side-by-side
- Add practitioner notes to saved analyses

---

**Note**: This is a development and validation tool. All HTMA analyses should be reviewed by qualified healthcare practitioners regardless of mode.

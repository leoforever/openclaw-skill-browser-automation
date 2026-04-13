# Browser CLI Command Reference

Complete reference for all `openclaw browser` commands.

---

## Lifecycle

### Status
```bash
openclaw browser status [--browser-profile <name>] [--json]
```

### Start
```bash
openclaw browser start [--browser-profile <name>]
```

### Stop
```bash
openclaw browser stop [--browser-profile <name>]
```
For attach-only/remote profiles: closes control session, releases overrides.

---

## Tab Management

### List Tabs
```bash
openclaw browser tabs [--browser-profile <name>] [--json]
```

### Current Tab
```bash
openclaw browser tab [--browser-profile <name>]
```

### New Tab
```bash
openclaw browser tab new [--browser-profile <name>]
```

### Select Tab
```bash
openclaw browser tab select <index> [--browser-profile <name>]
```

### Close Tab (by index)
```bash
openclaw browser tab close <index> [--browser-profile <name>]
```

### Open URL
```bash
openclaw browser open <url> [--browser-profile <name>]
```

### Focus Tab (by targetId)
```bash
openclaw browser focus <targetId> [--browser-profile <name>]
```

### Close Tab (by targetId)
```bash
openclaw browser close <targetId> [--browser-profile <name>]
```

---

## Navigation

### Navigate
```bash
openclaw browser navigate <url> [--browser-profile <name>]
```

### Resize Viewport
```bash
openclaw browser resize <width> <height> [--browser-profile <name>]
```

---

## Snapshots

### AI Snapshot (default, numeric refs)
```bash
openclaw browser snapshot [--browser-profile <name>] [--format ai]
```
Output includes `aria-ref="<n>"` for actions like `click 12`.

### ARIA Snapshot (no refs)
```bash
openclaw browser snapshot --format aria [--limit 200] [--browser-profile <name>]
```

### Interactive Role Snapshot
```bash
openclaw browser snapshot --interactive [--compact] [--depth 6] [--browser-profile <name>]
```
Output includes `[ref=e12]` for actions like `click e12`.

### Efficient Snapshot (preset)
```bash
openclaw browser snapshot --efficient [--browser-profile <name>]
```
Equivalent to `--interactive --compact --depth 6`.

### With Labels (screenshot overlay)
```bash
openclaw browser snapshot --interactive --labels [--browser-profile <name>]
```
Outputs `MEDIA:<path>` with labeled screenshot.

### Scoped to Iframe
```bash
openclaw browser snapshot --frame "<iframe selector>" --interactive [--browser-profile <name>]
```

### JSON Output
```bash
openclaw browser snapshot --interactive --json [--browser-profile <name>]
```

---

## Screenshots

### Viewport
```bash
openclaw browser screenshot [--browser-profile <name>]
```

### Full Page
```bash
openclaw browser screenshot --full-page [--browser-profile <name>]
```

### Element by Ref
```bash
openclaw browser screenshot --ref <ref> [--browser-profile <name>]
```
Ref can be numeric (`12`) or role (`e12`).

---

## Actions

All actions require a `ref` from `snapshot`. Refs are NOT stable across navigations.

### Click
```bash
openclaw browser click <ref> [--double] [--browser-profile <name>]
```

### Type
```bash
openclaw browser type <ref> "<text>" [--submit] [--browser-profile <name>]
```

### Press Key
```bash
openclaw browser press <key> [--browser-profile <name>]
```
Examples: `Enter`, `Tab`, `Escape`, `ArrowDown`.

### Hover
```bash
openclaw browser hover <ref> [--browser-profile <name>]
```

### Scroll Into View
```bash
openclaw browser scrollintoview <ref> [--browser-profile <name>]
```

### Drag
```bash
openclaw browser drag <fromRef> <toRef> [--browser-profile <name>]
```

### Select
```bash
openclaw browser select <ref> <option1> [option2...] [--browser-profile <name>]
```

### Fill Multiple Fields
```bash
openclaw browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]' [--browser-profile <name>]
```

### Highlight (Debug)
```bash
openclaw browser highlight <ref> [--browser-profile <name>]
```

### Evaluate JS
```bash
openclaw browser evaluate --fn "<js>" [--ref <ref>] [--browser-profile <name>]
```
Requires `browser.evaluateEnabled=true`.

---

## Wait Conditions

### Wait for Text
```bash
openclaw browser wait --text "<text>" [--timeout-ms 15000] [--browser-profile <name>]
```

### Wait for Selector
```bash
openclaw browser wait "<selector>" [--browser-profile <name>]
```

### Wait for URL (glob patterns)
```bash
openclaw browser wait --url "<glob>" [--browser-profile <name>]
```
Examples: `**/dashboard`, `**/api/*`.

### Wait for Load State
```bash
openclaw browser wait --load networkidle [--browser-profile <name>]
```
States: `load`, `domcontentloaded`, `networkidle`.

### Wait for JS Predicate
```bash
openclaw browser wait --fn "<js expression>" [--browser-profile <name>]
```
Example: `window.ready===true`.

### Combined Waits
```bash
openclaw browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
```

---

## File Handling

### Download (Arm Before Trigger)
```bash
openclaw browser download <ref> <filename> [--browser-profile <name>]
```
Run BEFORE clicking the download link.

### Wait for Download
```bash
openclaw browser waitfordownload <filename> [--browser-profile <name>]
```

### Upload (Arm Before Trigger)
```bash
openclaw browser upload <filepath> [--browser-profile <name>]
```
Run BEFORE clicking the file input.

### Upload Direct to Input
```bash
openclaw browser upload --input-ref <ref> <filepath> [--browser-profile <name>]
```

### Handle Dialog
```bash
openclaw browser dialog --accept [--browser-profile <name>]
openclaw browser dialog --dismiss [--browser-profile <name>]
```
Run BEFORE triggering the dialog.

---

## State Management

### Cookies
```bash
openclaw browser cookies [--browser-profile <name>] [--json]
openclaw browser cookies set <name> <value> --url "<url>" [--browser-profile <name>]
openclaw browser cookies clear [--browser-profile <name>]
```

### Storage
```bash
openclaw browser storage local get [--browser-profile <name>]
openclaw browser storage local set <key> <value> [--browser-profile <name>]
openclaw browser storage local clear [--browser-profile <name>]
openclaw browser storage session get/set/clear [--browser-profile <name>]
```

### Offline Mode
```bash
openclaw browser set offline on|--off [--browser-profile <name>]
```

### Headers
```bash
openclaw browser set headers --headers-json '{"X-Custom":"1"}' [--browser-profile <name>]
```

### HTTP Auth
```bash
openclaw browser set credentials <user> <pass> [--browser-profile <name>]
openclaw browser set credentials --clear [--browser-profile <name>]
```

### Geolocation
```bash
openclaw browser set geo <lat> <lon> --origin "<url>" [--browser-profile <name>]
openclaw browser set geo --clear [--browser-profile <name>]
```

### Media Preference
```bash
openclaw browser set media dark|light|no-preference|none [--browser-profile <name>]
```

### Timezone
```bash
openclaw browser set timezone <IANA timezone> [--browser-profile <name>]
```
Example: `America/New_York`, `Asia/Shanghai`.

### Locale
```bash
openclaw browser set locale <locale> [--browser-profile <name>]
```
Example: `en-US`, `zh-CN`.

### Device/Viewport
```bash
openclaw browser set device "<device name>" [--browser-profile <name>]
openclaw browser set viewport <width> <height> [--browser-profile <name>]
```
Device examples: `iPhone 14`, `Pixel 5`.

---

## Debugging

### Console Logs
```bash
openclaw browser console [--level error|warn|info] [--browser-profile <name>]
```

### Errors
```bash
openclaw browser errors [--browser-profile <name>]
openclaw browser errors --clear [--browser-profile <name>]
```

### Network Requests
```bash
openclaw browser requests [--filter <pattern>] [--browser-profile <name>]
openclaw browser requests --filter <pattern> --clear [--browser-profile <name>]
```

### Trace Recording
```bash
openclaw browser trace start [--browser-profile <name>]
# ... reproduce issue ...
openclaw browser trace stop [--browser-profile <name>]
```
Output: `TRACE:<path>`.

### Response Body
```bash
openclaw browser responsebody "<glob>" [--max-chars 5000] [--browser-profile <name>]
```

### PDF Export
```bash
openclaw browser pdf [--browser-profile <name>]
```

---

## JSON Output

Most commands support `--json` for scripting:

```bash
openclaw browser status --json
openclaw browser snapshot --interactive --json
openclaw browser cookies --json
openclaw browser requests --filter api --json
```

---

## Common Patterns

### Search Workflow
```bash
openclaw browser open https://www.bing.com
openclaw browser snapshot --interactive
openclaw browser type e15 "search query" --submit
openclaw browser wait --load networkidle
openclaw browser snapshot --limit 50
```

### Login Workflow
```bash
openclaw browser open https://example.com/login
openclaw browser snapshot --interactive
openclaw browser type e10 "username"
openclaw browser type e11 "password" --submit
openclaw browser wait --url "**/dashboard"
```

### Full Page Screenshot
```bash
openclaw browser open https://example.com
openclaw browser wait --load networkidle
openclaw browser screenshot --full-page
```

### Debug Failed Action
```bash
# Action fails
openclaw browser snapshot --interactive  # Get fresh refs
openclaw browser click e12              # Try new ref
openclaw browser highlight e12          # Verify target
openclaw browser errors --clear         # Clear errors
```

---

## Playwright Requirement

Features requiring Playwright:
- `navigate`, `act`, AI/role snapshots
- CSS-selector element screenshots
- Full PDF export

Install:
```bash
npx playwright install chromium
```

Works without Playwright:
- ARIA snapshots
- Page screenshots (managed browser with CDP)
- Existing-session ref screenshots

---

## Exit Codes

- `0` - Success
- Non-zero - Failure (check error message)

Signals:
- `SIGTERM` - Normal termination after output
- `SIGKILL` - Forced termination (timeout or error)

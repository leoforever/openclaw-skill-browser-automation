---
name: browser-automation
description: Browser automation using OpenClaw's managed browser profile. Use when needing to: open web pages, search the web, interact with elements (click/type/select), capture screenshots or snapshots, handle file downloads/uploads, manage browser state (cookies/storage), or debug web pages. Supports both CLI commands and browser tool calls.
---

# Browser Automation Skill

Automate browser interactions using OpenClaw's dedicated Chrome/Brave/Edge/Chromium profile.

## Quick Start

```bash
# Start browser
openclaw browser start

# Open page and get snapshot
openclaw browser open https://example.com
openclaw browser snapshot --interactive

# Interact using refs from snapshot
openclaw browser click e12
openclaw browser type e23 "search query" --submit

# Capture result
openclaw browser screenshot
```

## Core Workflow

1. **Start** → `openclaw browser start`
2. **Navigate** → `openclaw browser open <url>`
3. **Snapshot** → `openclaw browser snapshot --interactive` (get element refs)
4. **Act** → `openclaw browser click/type <ref>` (use refs from snapshot)
5. **Wait** → `openclaw browser wait --text/url/load` (if needed)
6. **Capture** → `openclaw browser screenshot/snapshot`

## Ref Types

| Type | Source | Example |
|------|--------|---------|
| Numeric | AI snapshot (default) | `12`, `23` |
| Role | Interactive snapshot | `e12`, `e23` |

**Important:** Refs expire after navigation. Re-run `snapshot` first.

## Key Commands

### Navigation & Tabs
```bash
openclaw browser open https://example.com
openclaw browser navigate https://example.com
openclaw browser tab new
openclaw browser tabs
```

### Snapshots (Required Before Actions)
```bash
openclaw browser snapshot                    # AI snapshot with numeric refs
openclaw browser snapshot --interactive      # Role refs (e12, e23)
openclaw browser snapshot --labels           # With screenshot overlay
```

### Actions
```bash
openclaw browser click e12
openclaw browser type e23 "text" --submit
openclaw browser press Enter
openclaw browser select e9 OptionA
openclaw browser fill --fields '[{"ref":"1","value":"Ada"}]'
```

### Wait Conditions
```bash
openclaw browser wait --text "Done"
openclaw browser wait --url "**/dashboard"
openclaw browser wait --load networkidle
openclaw browser wait --fn "window.ready===true"
```

### Screenshots
```bash
openclaw browser screenshot
openclaw browser screenshot --full-page
openclaw browser screenshot --ref e12
```

### State Management
```bash
openclaw browser cookies
openclaw browser storage local get/set/clear
openclaw browser set headers --headers-json '{"X-Custom":"1"}'
openclaw browser set timezone America/Shanghai
```

### Debugging
```bash
openclaw browser console --level error
openclaw browser errors --clear
openclaw browser trace start/stop
openclaw browser highlight e12
```

## File Handling

```bash
# Download (arm BEFORE triggering)
openclaw browser download e12 filename.pdf
openclaw browser waitfordownload filename.pdf

# Upload (arm BEFORE triggering)
openclaw browser upload /path/to/file.pdf
```

## Configuration

Ensure browser is enabled in `~/.openclaw/openclaw.json`:

```json5
{
  browser: { enabled: true, defaultProfile: "openclaw" },
  plugins: { entries: { browser: { enabled: true } } }
}
```

If `plugins.allow` is set, include `"browser"` in the list.

## Profiles

- `openclaw` (default) - Isolated managed browser
- `user` - Attach to user's signed-in Chrome (requires approval)

Use `--browser-profile <name>` to specify.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Action fails | Re-run `snapshot`, use fresh ref |
| Playwright missing | `npx playwright install chromium` |
| Browser won't start | Check config, restart Gateway |
| Refs not working | Refs expire - snapshot first |
| Command timeout | Use longer timeout (60s) for open/navigate commands |

## Performance Notes

- **Recommended timeout:** 60 seconds for navigation commands (`open`, `navigate`, `wait`)
- **Snapshot before action:** Always run `snapshot --interactive` before `click`/`type` since refs expire after navigation
- **Exit codes:** Some commands may return SIGKILL (128+9) even on success - check actual output
- **Chinese websites:** Works well with Baidu, Doubao, Bing; tested successfully

## Tested Commands

All commands tested on Linux with Chromium:

| Command | Status |
|---------|--------|
| status, tabs, tab new | ✅ PASS |
| open, navigate | ✅ PASS |
| snapshot (all modes) | ✅ PASS |
| click, type, press | ✅ PASS |
| wait --load | ✅ PASS |
| screenshot | ✅ PASS |
| cookies, storage | ✅ PASS |
| errors, console | ✅ PASS |
| resize, set timezone | ✅ PASS |

## Detailed Reference

For complete command reference with all options, see:
- [references/commands.md](references/commands.md) - Full CLI reference
- [references/examples.md](references/examples.md) - Common workflows

## Security

- Browser control is loopback-only
- `evaluate` and `wait --fn` execute arbitrary JS - disable with `browser.evaluateEnabled=false` if not needed
- Treat sessions as sensitive (may contain logins)

---

**Version:** 1.0  
**Created:** 2026-04-10

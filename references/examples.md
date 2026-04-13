# Browser Automation Examples

Common workflows and patterns.

---

## Web Search

### Basic Search
```bash
# Open search engine
openclaw browser open https://www.bing.com

# Get interactive snapshot
openclaw browser snapshot --interactive

# Type and submit (find search box ref from snapshot)
openclaw browser type e15 "today news" --submit

# Wait for results
openclaw browser wait --load networkidle

# Capture results
openclaw browser snapshot --limit 50
```

### Search and Screenshot Results
```bash
openclaw browser open https://www.bing.com
openclaw browser snapshot --interactive
openclaw browser type e15 "AI developments 2026" --submit
openclaw browser wait --text "Results"
openclaw browser screenshot --full-page
```

---

## Login Flows

### Standard Login
```bash
openclaw browser open https://example.com/login
openclaw browser snapshot --interactive

# Find username/password/login button refs
openclaw browser type e10 "myusername"
openclaw browser type e11 "mypassword" --submit

# Wait for successful login
openclaw browser wait --url "**/dashboard"
openclaw browser screenshot
```

### Login with 2FA
```bash
# Initial login
openclaw browser type e10 "username"
openclaw browser type e11 "password" --submit

# Wait for 2FA page
openclaw browser wait --text "verification code"

# Enter 2FA code
openclaw browser snapshot --interactive
openclaw browser type e20 "123456" --submit

# Wait for dashboard
openclaw browser wait --url "**/dashboard"
```

---

## Data Extraction

### Extract Table Data
```bash
openclaw browser open https://example.com/data
openclaw browser wait --load networkidle
openclaw browser snapshot --interactive

# Navigate table if needed
openclaw browser click e45  # Next page button

# Extract via snapshot
openclaw browser snapshot --limit 200
```

### Scrape Multiple Pages
```bash
# Page 1
openclaw browser open https://example.com/items
openclaw browser snapshot > page1.md

# Click next
openclaw browser click e50
openclaw browser wait --load networkidle

# Page 2
openclaw browser snapshot > page2.md
```

---

## Form Filling

### Simple Form
```bash
openclaw browser open https://example.com/contact
openclaw browser snapshot --interactive

# Fill fields
openclaw browser type e5 "John Doe"
openclaw browser type e8 "john@example.com"
openclaw browser type e12 "Message here"
openclaw browser click e15  # Submit button
```

### Complex Form with Select
```bash
openclaw browser snapshot --interactive

# Fill text fields
openclaw browser fill --fields '[
  {"ref":"1","type":"text","value":"John"},
  {"ref":"2","type":"text","value":"Doe"},
  {"ref":"3","type":"email","value":"john@example.com"}
]'

# Select dropdown
openclaw browser select e10 "Option A"

# Check checkbox
openclaw browser click e14

# Submit
openclaw browser click e20 --submit
```

---

## File Operations

### Download File
```bash
# ARM download hook BEFORE clicking
openclaw browser download e25 report.pdf

# Trigger download
openclaw browser click e25

# Wait for completion
openclaw browser waitfordownload report.pdf
```

### Upload File
```bash
# ARM upload hook BEFORE clicking file input
openclaw browser upload /path/to/document.pdf

# Trigger file chooser
openclaw browser click e10

# Or upload directly to input
openclaw browser upload --input-ref e10 /path/to/file.pdf
```

---

## Debugging Workflows

### Action Fails - Element Not Found
```bash
# Original action failed
openclaw browser click e12  # "not visible"

# Debug steps:
# 1. Get fresh snapshot (refs expire!)
openclaw browser snapshot --interactive

# 2. Try new ref
openclaw browser click e15

# 3. If still fails, highlight to verify
openclaw browser highlight e15

# 4. Check errors
openclaw browser errors
```

### Page Not Loading Properly
```bash
# Clear state
openclaw browser errors --clear
openclaw browser requests --clear

# Reload
openclaw browser navigate https://example.com
openclaw browser wait --load networkidle

# Check console
openclaw browser console --level error
```

### Record Trace for Deep Debug
```bash
# Start trace
openclaw browser trace start

# Reproduce issue
openclaw browser click e12
openclaw browser type e15 "test"

# Stop trace
openclaw browser trace stop
# Output: TRACE:/tmp/openclaw/trace-xxx.zip
```

---

## State Management

### Set Custom Headers
```bash
openclaw browser set headers --headers-json '{
  "X-Debug-Mode": "true",
  "X-Test-ID": "12345"
}'
```

### Set Mobile Viewport
```bash
openclaw browser set device "iPhone 14"
openclaw browser set viewport 390 844
```

### Set Location/Timezone
```bash
openclaw browser set timezone America/New_York
openclaw browser set locale en-US
openclaw browser set geo 40.7128 -74.0060 --origin "https://maps.google.com"
```

### Manage Cookies
```bash
# Get current cookies
openclaw browser cookies --json

# Set auth cookie
openclaw browser cookies set session abc123 --url "https://example.com"

# Clear all cookies
openclaw browser cookies clear
```

---

## Wait Patterns

### Wait for Specific URL
```bash
openclaw browser click e10  # Trigger navigation
openclaw browser wait --url "**/success"
```

### Wait for Element to Appear
```bash
openclaw browser click e5  # Trigger action
openclaw browser wait "#result-container"
```

### Wait for Network Idle
```bash
openclaw browser navigate https://example.com
openclaw browser wait --load networkidle
```

### Wait for JS Condition
```bash
openclaw browser click e10  # Trigger async operation
openclaw browser wait --fn "document.querySelector('.done') !== null"
```

### Complex Wait (Multiple Conditions)
```bash
openclaw browser click e10
openclaw browser wait "#main-content" \
  --url "**/dashboard" \
  --load networkidle \
  --timeout-ms 30000
```

---

## Screenshot Patterns

### Full Page Screenshot
```bash
openclaw browser open https://example.com
openclaw browser wait --load networkidle
openclaw browser screenshot --full-page
```

### Element Screenshot
```bash
openclaw browser snapshot --interactive
openclaw browser screenshot --ref e25
```

### Screenshot with Labels
```bash
openclaw browser snapshot --interactive --labels
# Outputs MEDIA:<path> with labeled overlay
```

---

## Multi-Tab Workflows

### Open Multiple Tabs
```bash
# Tab 1
openclaw browser open https://example.com
openclaw browser tab new

# Tab 2
openclaw browser open https://news.ycombinator.com
openclaw browser tabs  # List all tabs
```

### Switch Between Tabs
```bash
# Get tabs
openclaw browser tabs

# Select by index
openclaw browser tab select 2

# Or focus by targetId
openclaw browser focus ABCD1234
```

---

## Testing Workflows

### Visual Regression Check
```bash
# Baseline
openclaw browser open https://example.com
openclaw browser wait --load networkidle
openclaw browser screenshot --full-page
# Save as baseline.png

# After changes
openclaw browser open https://example.com
openclaw browser wait --load networkidle
openclaw browser screenshot --full-page
# Compare with baseline
```

### Form Validation Test
```bash
openclaw browser open https://example.com/signup

# Submit empty form
openclaw browser snapshot --interactive
openclaw browser click e20  # Submit

# Wait for validation error
openclaw browser wait --text "required"
openclaw browser screenshot
```

---

## Tips

1. **Always snapshot first** - Refs expire after navigation
2. **Use role refs** - `e12` is more stable than numeric `12`
3. **Wait for conditions** - Don't assume instant loading
4. **Highlight to debug** - `highlight e12` shows what's targeted
5. **Clear errors** - `errors --clear` before retrying
6. **Use JSON output** - `--json` for scripting

# Bubble "Run JavaScript" Reference Scripts

Copy-pasteable scripts for Bubble's Toolbox "Run JavaScript" workflow actions.

## Conventions

- **Dynamic fields at top**: Bubble inline expressions (pink tokens) can't be copied over. Declare them as `var` at the top, reference variables below.
- **Use backticks**: Bubble-resolved values may contain newlines or quotes that break `"..."` strings. Always use template literals.
- **JS2B output format**: `output1` = action name (text), `output2` = JSON payload (text). Only 2 outputs needed per JS2B element.
- **Parsing output2**: In a "Run JavaScript" step, use `var data = JSON.parse(output2)` to extract fields.
- **Bubble → React** (push data): Call `window.appUI.<setter>(data)` — e.g. `setDailyQuestion`, `setUserData`.
- **React → Bubble** (actions): Routed via JS2B. Route workflows with "Only when output1 is '...'"

## Files

| File | JS2B Element | Actions |
|------|-------------|---------|
| `daily-question.js` | JS2B - Daily Question event | `fetch`, `vote` |
| `simulator.js` | bubble_fn_simulator | `fetch_instructions` |

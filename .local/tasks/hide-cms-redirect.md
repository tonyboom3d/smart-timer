# Hide CMS Mode and Redirect Option

## What & Why
Hide two options from the dashboard UI without removing the underlying logic:
1. The **Dynamic (CMS)** timer mode in the Timer tab.
2. The **Redirect to URL** completion action in the Actions tab.

Both will be commented out in the JSX so they no longer appear in their dropdowns, but the schema types, store handling, and rendering logic stay intact so they can be re-enabled later by uncommenting a single line each.

## Done looks like
- In the Timer tab's Mode dropdown, only **Fixed Date** and **Recurring** appear; **Dynamic (CMS)** is gone.
- In the Actions tab's Completion Action dropdown, **Redirect to URL** is gone; the remaining options work as before.
- All the supporting fields tied to the redirect option (URL input, redirect target field) are no longer reachable through the UI but still exist in code and remain functional if the option is re-enabled.
- All the supporting fields tied to Dynamic (CMS) (CMS field name input, etc.) are no longer reachable through the UI but still exist in code and remain functional if the option is re-enabled.
- No TypeScript errors, no runtime errors.

## Out of scope
- Deleting the `dynamic` mode or `redirect` completion action from the schema, store, or rendering logic.
- Migrating any saved configs/templates that already use these values (they should still load and work).
- Changing the export-HTML feature plan.

## Steps
1. **Comment out the two options** in the dashboard panel:
   - The `Dynamic (CMS)` `<SelectItem>` in the Mode dropdown (Timer tab).
   - The `Redirect to URL` `<SelectItem>` in the Completion Action dropdown (Actions tab).
   Use a brief inline comment noting that these are intentionally hidden and easy to restore.
2. **Verify no orphaned UI sections crash.** Quickly confirm that the conditional sections that only render when `mode === "dynamic"` or `completionAction === "redirect"` are still safe (they simply won't render because the user can no longer pick those values from the UI). Don't modify them.
3. **Sanity-check** by opening the dashboard and confirming both dropdowns no longer expose the hidden options and the rest of the UI works.

## Relevant files
- `client/src/components/dashboard/DashboardPanel.tsx:599-601`
- `client/src/components/dashboard/DashboardPanel.tsx:1377-1378`

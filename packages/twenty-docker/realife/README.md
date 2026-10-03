# Realife build of Twenty

Twenty `v2.43.0` with Realife's mobile UI changes. Only the frontend differs
from the official release: the image is `twentycrm/twenty:v2.43.0` with
`dist/front` replaced, so the server, migrations and worker stay exactly as
released.

## What is changed

- Mobile tab bar: home, opportunities, create (+), tasks, search. The create
  button opens a menu for opportunities, people, companies, tasks, notes and a
  new AI chat.
- Mobile home: today's and overdue tasks assigned to you, above the menu.
- `realife-mobile.css`: CSS tweaks injected at startup by `patch-index.sh`
  (list toolbar icons, larger menu rows, 16px inputs).

## Build and deploy

GitHub Actions (`.github/workflows/realife-build.yaml`) can build the frontend,
but the REALIFE-HD organization's Actions are currently blocked by a billing
lock. Until that is resolved, build locally and deploy with the script.

On Windows a few upstream build scripts do not run under `cmd`, so build the
dependencies once by hand, then the frontend:

```bash
corepack yarn nx build twenty-shared
corepack yarn nx build twenty-ui
# twenty-sdk: run its build target, then finish its last step in Git Bash
# (rimraf rejects glob patterns on Windows), see the session notes
corepack yarn nx run twenty-front-component-renderer:sandbox:prebuild --excludeTaskDependencies
corepack yarn nx run twenty-front-component-renderer:build --excludeTaskDependencies
corepack yarn nx run twenty-front:lingui:extract --excludeTaskDependencies
corepack yarn nx run twenty-front:lingui:compile --excludeTaskDependencies
NODE_OPTIONS=--max-old-space-size=8192 corepack yarn nx run twenty-front:build --excludeTaskDependencies
```

Then, from the repository root:

```bash
bash packages/twenty-docker/realife/deploy.sh v2.43.0-realife.<n>
```

The CRM restarts and is unavailable for about two minutes. The script prints
the rollback command if Twenty does not come back healthy.

## Upgrading Twenty

1. Fetch the new upstream tag (`twenty/vX.Y.Z`) and rebase `realife/main` on it.
2. Bump `BASE_IMAGE` in `Dockerfile` and in the workflow.
3. Build, deploy, and check on a phone that the tab bar, the create menu and
   the home tasks still work.

Translations for new strings live in `packages/twenty-front/src/locales/ja-JP.po`.
`lingui:extract` reformats every catalog; commit only the Japanese entries.

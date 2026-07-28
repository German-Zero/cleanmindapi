# Cleanmindapi

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/nest?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve cleanmindapi
```

## Discord notifications

CleanMind uses two independent Discord integrations:

- A bot sends personal notifications by direct message after the user connects their Discord account through OAuth2.
- An incoming webhook posts operational server messages to a private Discord channel.

Create an application in the Discord Developer Portal, add a bot, install it in the CleanMind server, and configure:

```env
DISCORD_CLIENT_ID=application-id
DISCORD_CLIENT_SECRET=oauth-client-secret
DISCORD_BOT_TOKEN=bot-token
DISCORD_REDIRECT_URI=http://localhost:3000/api/notifications/discord/callback
DISCORD_OAUTH_SUCCESS_URL=http://localhost:3001/settings

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/id/token
DISCORD_WEBHOOK_USERNAME=CleanMind
DISCORD_WEBHOOK_AVATAR_URL=
DISCORD_WEBHOOK_TIMEOUT_MS=5000
```

The redirect URI must match the URI configured under OAuth2 in the Discord Developer Portal. Never expose the bot token, client secret, or webhook URL to the frontend.

Authenticated API flow:

1. `POST /api/notifications/discord/connection` returns the Discord authorization URL.
2. Redirect the browser to that URL. Discord returns to the configured callback and links the verified Discord user.
3. `GET /api/notifications/discord/connection` returns the connection status.
4. `POST /api/notifications/discord/test` sends a test direct message.
5. `DELETE /api/notifications/discord/connection` disconnects the account.

Apply the database migration before using the connection flow:

```sh
npx prisma migrate deploy
```

## Multi-factor authentication

MFA uses RFC 6238 TOTP applications (Google Authenticator, Microsoft Authenticator, 1Password, and compatible apps) plus ten single-use recovery codes. TOTP secrets are encrypted with AES-256-GCM before persistence.

Generate the required 32-byte encryption key once:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Store the result outside the repository:

```env
MFA_ENCRYPTION_KEY=base64-encoded-32-byte-key
MFA_ISSUER=CleanMind
MFA_CHALLENGE_EXPIRES_IN_SECONDS=300
MFA_MAX_ATTEMPTS=5
MFA_SETUP_MAX_AUTH_AGE_SECONDS=600
```

Do not rotate `MFA_ENCRYPTION_KEY` without first re-encrypting existing authenticator secrets. Losing this key makes existing TOTP enrollments unusable.

Enrollment API flow:

1. `GET /api/auth/mfa/status`
2. `POST /api/auth/mfa/setup` requires a login performed within the configured maximum age, then returns the Base32 secret and `otpauthUri`; render the URI as a QR code in the frontend.
3. `POST /api/auth/mfa/enable` with `{ "code": "123456" }` returns ten recovery codes once and revokes existing refresh sessions.
4. `POST /api/auth/mfa/recovery-codes` rotates recovery codes after a valid TOTP or recovery code.
5. `POST /api/auth/mfa/disable` disables MFA after a valid TOTP or recovery code and revokes existing refresh sessions.

When MFA is enabled, local and Google login return this instead of creating a session:

```json
{
  "mfaRequired": true,
  "challengeToken": "one-use-token",
  "expiresIn": 300
}
```

Complete login with `POST /api/auth/mfa/verify` and `{ "challengeToken": "...", "code": "123456" }`. A valid response creates the normal access and refresh cookies. Challenges are single-use and limited to the configured number of attempts.

## Pomodoro API

The authenticated Pomodoro API keeps the timer state associated with the current user while the visible countdown remains a frontend responsibility.

Available endpoints:

```text
GET   /api/pomodoro/settings
PATCH /api/pomodoro/settings
POST  /api/pomodoro/sessions
GET   /api/pomodoro/sessions/active
PATCH /api/pomodoro/sessions/:id/pause
PATCH /api/pomodoro/sessions/:id/resume
PATCH /api/pomodoro/sessions/:id/complete
PATCH /api/pomodoro/sessions/:id/interrupt
PATCH /api/pomodoro/sessions/:id/cancel
GET   /api/pomodoro/summary?days=7
```

Start a session with an optional owned task and break type:

```json
{
  "taskId": "optional-task-uuid",
  "breakType": "SHORT"
}
```

The response contains `startedAt`, `plannedFocusSeconds`, `plannedBreakSeconds`, `pausedAt`, and `accumulatedPausedSeconds`. The frontend calculates the countdown from those persisted timestamps so background tabs do not make the timer drift. Complete or interrupt the session with the measured durations:

```json
{
  "actualFocusSeconds": 1500,
  "actualBreakSeconds": 300
}
```

Only one active session is allowed per user. Dashboard responses include a small `pomodoro` summary with today's focused seconds, break seconds, and completed sessions. The API deliberately avoids streaks, rankings, and productivity scores.

## Whiteboard API

The authenticated Whiteboard API stores one versioned document per user, including the five custom colors:

```text
GET /api/whiteboard
PUT /api/whiteboard
```

`GET` returns an empty version 3 document when the user has not saved one yet. `PUT` replaces the document using last-write-wins semantics:

```json
{
  "version": 3,
  "elements": [],
  "backgroundImage": null,
  "savedColors": ["#8B5CF6"]
}
```

## Browser access and CORS

Direct browser requests are allowed only from configured origins and may include authentication cookies:

```env
CORS_ORIGINS=http://localhost:3001
```

Use a comma-separated list in deployed environments, without trailing slashes. The frontend development proxy avoids cross-origin requests, but CORS remains available for direct API access.

To create a production bundle:

```sh
npx nx build cleanmindapi
```

To see all available targets to run for a project, run:

```sh
npx nx show project cleanmindapi
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/nest:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/nest?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

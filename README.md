# Kasi on Vercel + GitHub (free)

Kasi is made of three free pieces:

- **GitHub** holds the code.
- **Vercel** hosts the app and its small server (`api/index.js`). It redeploys automatically every time you change the code on GitHub.
- **Neon Postgres**, added from inside Vercel, is the database. Each person's data is stored under their own account and the server never returns another person's data.

You don't need to install anything on your computer. Everything below happens in the browser.

## 1. Put the code on GitHub

1. Sign in at https://github.com (create a free account if needed).
2. Click **+** at the top right, then **New repository**.
   - Name it `kasi`.
   - Choose **Private**.
   - Leave everything else as it is and click **Create repository**.
3. On the next page, click **uploading an existing file**.
4. Open the unzipped `kasi-vercel` folder on your computer. Select **everything inside it** (`api`, `public`, `package.json`, `vercel.json` and the rest) and drag it into the page.
   - Drag the contents, not the folder itself. `vercel.json` must end up at the top level of the repository.
5. Click **Commit changes**.

> Prefer Git? In the `kasi-vercel` folder run:
> `git init && git add . && git commit -m "Kasi" && git branch -M main && git remote add origin https://github.com/YOUR-NAME/kasi.git && git push -u origin main`

## 2. Deploy on Vercel

1. Go to https://vercel.com and choose **Continue with GitHub**. The free **Hobby** plan is all you need.
2. Click **Add New…**, then **Project**, and **Import** your `kasi` repository. If you don't see it, click **Adjust GitHub App Permissions** and give Vercel access to it.
3. Set **Framework Preset** to **Other**. Leave the build settings alone.
4. Click **Deploy**.

The site goes live, but it won't let you sign in until the database is connected in the next step.

## 3. Add the database

1. In your Vercel project, open the **Storage** tab.
2. Click **Create Database**, choose **Neon** (Serverless Postgres), then **Continue**.
3. Pick the **Free** plan and the region **Singapore (ap-southeast-1)**, which is closest to Sri Lanka. The app's server also runs in Singapore, so this keeps it fast.
4. Click **Create**, then connect it to your `kasi` project for all environments. This adds a `DATABASE_URL` setting to the project automatically.
5. Open the **Deployments** tab, click **⋯** on the latest deployment, then **Redeploy**.

There's no need to create tables. Kasi sets up its database on first use.

## 4. Create your account

Open your site, for example `https://kasi-yourname.vercel.app`. The first account created becomes the owner, and after that new sign-ups are closed.

## Install on your phone

- **iPhone:** open the site in **Safari**, tap **Share**, then **Add to Home Screen**.
- **Android:** open the site in **Chrome**, tap **⋮**, then **Install app** (or **Add to Home screen**).

Kasi then opens full screen with its own icon and works offline. Changes you make offline sync when you're back online.

## Let family members sign up (optional)

1. In Vercel, go to **Settings → Environment Variables**.
2. Add `SIGNUP_CODE` with a code of your choice and save.
3. Redeploy.
4. Share the code with your family.

Each person gets their own private ledger.

## Updating Kasi

Change any file on GitHub, either in the browser with the pencil icon or by uploading a new version, and commit. Vercel redeploys within about a minute. Phones pick up the new version the next time Kasi is opened with a connection.

## Your own domain (optional)

In Vercel, go to **Settings → Domains** and add a domain you own, for example `money.yourname.lk`.

## Good to know

- **Cost:** Vercel Hobby is free for personal, non-commercial use. Neon's free plan includes about 0.5 GB of storage at the time of writing. That's years of transactions; receipt photos use the most space, at roughly 150 KB each.
- **First load after a quiet period:** Neon's free database sleeps when unused, so the first request after a long idle period can take a second or two longer.
- **Backups:** each person can use **Settings → Download backup** in the app. For the whole database, Neon's console (Vercel **Storage**, then **Open in Neon**) has branching and point-in-time restore.

## Security summary

- **Passwords:** hashed with PBKDF2-SHA256 at 310,000 iterations with a unique salt. They are never stored in plain text.
- **Sessions:** a random 256-bit token sent as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie. Only its hash is stored. Sessions last 30 days and are extended while you use the app.
- **Login protection:** 5 wrong passwords locks that account for 15 minutes.
- **Cross-site protection:** writes must come from your own site and carry a custom header.
- **Content Security Policy:** set in `vercel.json`, so the page runs only its own script.
- **Account controls:** you can change your password (which signs out your other devices) or delete your account and all its data from Settings.
- **On-device copy:** each phone keeps a copy of your data for offline use. It is cleared when you sign out.
- **Secrets:** the database connection string lives only in Vercel's environment variables, never in the code on GitHub.

## Files

```
api/index.js          sign-in and data API (Vercel Function)
public/               the app
  index.html          page shell
  app.js              the whole app
  styles.css          design and mobile layout
  sw.js               offline support
  manifest.webmanifest  install-as-app settings
  icons/              app icons
vercel.json           routing, region and security headers
package.json          server dependency (Neon driver)
schema.sql            database tables (created automatically)
```

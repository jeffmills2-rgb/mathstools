# Putting it online — later

**Not on day one.** Everything in this template works by opening `index.html` from
your own machine. Deployment is worth doing once you have three or four tools you
actually use and want to send a link home instead of a file.

Read the "Before you publish anything" checklist at the bottom first. It is the part
that matters.

---

## Option A — GitHub Pages

Free, no account beyond GitHub, and the repository is the site. Best if you're
already putting the folder on GitHub for backup.

1. Create a new repository on GitHub. Public. Name it something short and lowercase
   (it becomes part of the URL).
2. Push this folder to it. If you've never used git, GitHub Desktop does the whole
   thing with buttons.
3. In the repository: **Settings → Pages**.
4. Under "Build and deployment", set Source to **Deploy from a branch**, branch
   **main**, folder **/ (root)**. Save.
5. Wait two or three minutes. Your site appears at
   `https://<your-username>.github.io/<repository-name>/`.

Every push updates the live site within a minute or so.

**Watch out for:** the site lives in a subfolder, so links starting with `/` will
break. Use relative links (`worksheet-creators/...`) rather than absolute
(`/worksheet-creators/...`). This template already uses relative links throughout —
keep it that way and you'll be fine.

---

## Option B — Netlify

Free tier, drag-and-drop simple, and gives you a top-level URL rather than a
subfolder. Best if you want a custom domain later.

**The quickest version:** drag the folder onto the Netlify "Sites" page. It's live
in seconds at a random URL you can rename. No git required.

**The version that updates itself:** connect Netlify to your GitHub repository.
Every push redeploys.

If you go this route, add a `netlify.toml` at the root:

```toml
[build]
  publish = "."
```

That's the whole file — it tells Netlify there's nothing to build and to serve the
folder as-is.

---

## Which one?

| | GitHub Pages | Netlify |
|---|---|---|
| Setup effort | Medium (needs git) | Low (drag and drop) |
| URL | `username.github.io/repo/` | `yoursite.netlify.app` |
| Custom domain | Yes | Yes, easier |
| Auto-deploy on push | Yes | Yes |
| Subfolder link gotcha | Yes | No |

Either is fine. Pick whichever you'll actually finish setting up.

---

## Before you publish anything

Public means public. A URL you haven't shared is still findable. Work through this
before the first deploy, and again whenever you add something new.

- [ ] **No student names, photos, or work anywhere** — including in example data,
      screenshots, and test files you forgot to delete.
- [ ] **No school logos or branding** unless you have permission. This is a real
      issue for department employees; check your employer's policy on publishing
      work-related material.
- [ ] **No copyrighted questions** copied from a textbook or a commercial resource.
      Generated questions are yours. Typed-out exam questions are not.
- [ ] **Nothing collects data.** No analytics scripts, no forms, no logins, no
      third-party embeds. If a tool stores anything, it stores it on the student's
      own device and you can say so plainly.
- [ ] **No API keys, tokens or passwords** in any file. Search the whole folder for
      `key`, `token`, `secret` and `password` before you push.
- [ ] **Check `.gitignore`** — no `.DS_Store`, no personal notes you didn't mean to
      publish.
- [ ] **Your own name and contact details** — decide deliberately what goes in the
      footer. A first name and a school is enough for most people.

---

## If you're doing this as a school or department

Different conversation. Publishing under a school's name, using school branding, or
hosting anything students log into brings in your employer's ICT and privacy
policies — and in a public school, likely departmental approval. Ask first.

Nothing in this template requires any of that, and that's the point: a personal,
data-free, static site of teaching tools is about the lowest-friction thing you can
put on the internet. Keep it that way for as long as you can.

# _build/

Two generators. **Not part of the handout** — the zip is built from `starter-pack/`
only, and participants never see this folder.

| Script | Writes | Reads |
|---|---|---|
| `build-start-here.py` | `starter-pack/START-HERE.html` | the five human-facing `.md` files |
| `build-snippets.py` | `starter-pack/SNIPPETS.html` | nothing — the snippets are inline in the script |

```bash
cd "vibe-code/_build"
python3 build-start-here.py      # needs: pip3 install markdown
python3 build-snippets.py
```

## Why this exists

`START-HERE.html` is a rendered copy of the markdown guides, because a `.md` file
double-clicked on a Mac with Claude installed opens a chat window instead of showing
the text. Two copies of the same words is a drift risk, so:

**If you edit `TEN-MINUTES.md`, `WORKSHOP.md`, `PROMPTS.md`, `CLAUDE-example.md` or
`DEPLOY.md`, re-run `build-start-here.py` and rebuild the zip.** Otherwise the page
people actually read still says the old thing.

To rebuild the zip after any change to `starter-pack/`:

```bash
cd vibe-code
rm -rf /tmp/pkg && mkdir -p /tmp/pkg
cp -R starter-pack /tmp/pkg/maths-vibe-coding-starter
find /tmp/pkg -name ".DS_Store" -delete
(cd /tmp/pkg && zip -rq maths-vibe-coding-starter.zip maths-vibe-coding-starter)
mv /tmp/pkg/maths-vibe-coding-starter.zip .
```

Then update the size and file count on `vibe-code/index.html`.

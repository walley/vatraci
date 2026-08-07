# FAD frontend (fad-fe-003)

Frontend for the FAD system - Vue 2 + Vuetify 2. `install.sh` generates the
frontend into `dist/v4` as **static HTML/JS/CSS files** (the version is set by
the `VERSION` constant in `src/config/config.js`). There is no frontend
runtime process - nothing is started after the build. The files are served by
the httpd daemon (nginx).

## Requirements

Two separate Node environments are used:

- **Backend node** - the system Node (e.g. Node 12). Its process is started by
  the system and is **never touched** by this project.
- **Build node** - a modern Node (>= 20, Node 22 recommended) used only for the
  one-time frontend generation (`npm install` / build). It can be the system
  Node only if it is already >= 20; otherwise `install.sh` automatically picks
  the highest user-level nvm Node >= 20, or you can point it at one explicitly:

```bash
FAD_NODE=/path/to/node22 ./install.sh
```

This project does not start or stop any node process, does not install Node and
does not change any system settings. The backend stays on its system Node.

## Quick start

Unpack the sources and run `install.sh` **from the unpacked directory** - it
prepares the build environment and generates the frontend in place:

```bash
tar -xzf sources.tar.gz
cd fad-fe-003
./install.sh
```

`install.sh` installs dependencies, checks for and updates outdated packages
(`npm outdated` / `npm update`) and builds the app into `dist/<version>` (e.g.
`dist/v4`). To skip the
package update step, run with `FAD_NO_UPDATE=1`.

Note: `package-lock.json` is intentionally NOT shipped. `install.sh` starts from
a clean `node_modules` and runs `npm install`, which generates a fresh lockfile.

## Deploying with nginx

Point nginx at the generated static files. Example location block:

```nginx
location /fad-fe/v4/ {
    alias /path/to/unpacked-sources/dist/v4/;
    try_files $uri $uri/ /fad-fe/v4/index.html;
}
```

Reload nginx after any change:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

The backend API must be reachable under `/fad-be/v1` (nginx proxy or direct
URL, see Configuration below).

## Configuration - fixed paths

All deployment paths are **hardcoded** in `src/config/config.js` - no
environment variables are used. Edit the constants and rebuild:

```js
// Global version - single source of truth for dist/<version>, /fad-fe/<version>/
const VERSION = "v4";

// Backend API base URI (no trailing slash, no /api suffix)
const BACKEND_API_URI = "https://fada.hasici-ol.cz/fad-be/v1";

// Base URI of this frontend (trailing slash) - derived from VERSION
const FRONTEND_BASE_URI = `https://fadc.hasici-ol.cz/fad-fe/${VERSION}/`;
```

- `VERSION` - the frontend version. Changing it updates the output directory
  (`dist/<version>`), the public path (`/fad-fe/<version>/` in `vue.config.js`)
  and `FRONTEND_BASE_URI` in one place.
- `BACKEND_API_URI` - where the backend lives (`/fad-be/v1`). The `/api` suffix
  and auth/login paths are derived from it.
- `FRONTEND_BASE_URI` - where this frontend is served from (must match the
  nginx `location`).

After changing the URLs:

```bash
./install.sh
```

## Development

```bash
npm install          # generates package-lock.json on first run
npm run serve        # dev server with hot reload
```

## Production build

```bash
npm run build       # outputs to dist/<version> (from config.js VERSION)
```

## Lint

```bash
npm run lint
```

## Creating the source package

```bash
./source_package_creator.sh [OUTPUT_PATH]   # default: ./sources.tar.gz
```

Builds a minimal `sources.tar.gz` containing only the files needed to build the
frontend (no `node_modules`, `dist`, backups or dead files).

## Project structure

```
install.sh                      prepare build env (Node >= 20) and build dist/<version> in place
src/                            application source
  components/                   global components (Navigation, GlobalData...)
  config/config.js              fixed deployment paths (backend API URI, frontend base URI)
  mixins/                       shared mixins
  plugins/                      vue-resource / vuetify setup
  router/                       routes
  store/                        vuex store (auth + global data state)
  views/                        pages (planner, order, fad, admin)
public/                         static assets (favicon, index.html shell)
```

## Backend API prefix

The frontend calls the backend under `/fad-be/v1`. The backend service must be
reachable at the URL set in `BACKEND_API_URI`.

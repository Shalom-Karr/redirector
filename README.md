# Universal SK Redirector

A Tampermonkey userscript that automatically redirects filtered or blocked web pages to custom mirror sites or a proxy fallback. When a content filter (such as Techloq) blocks a page, the script detects the blocked URL and seamlessly sends you to an unfiltered version.

## Features

- **YouTube** → Redirects videos, playlists, channels, and shorts to a custom frontend
- **Reddit** → Redirects to a custom Reddit mirror, preserving the original path
- **JTech Forums** → Redirects to a custom mirror, preserving the original path
- **Techloq filter bypass** → Detects blocked URLs on Techloq filter pages and redirects to the appropriate mirror or a proxy fallback
- **Proxy fallback** → Sites without a dedicated mirror are routed through a generic web proxy

## How It Works

1. When the script detects a supported domain (YouTube, Reddit, JTech Forums), it immediately redirects to the corresponding custom site.
2. When a Techloq filter page is encountered, the script polls the page for the original blocked URL, then redirects to:
   - A **custom mirror** if a redirect rule exists for that domain.
   - A **proxy service** as a fallback for all other domains.

## Installation

### Prerequisites

Install the **Tampermonkey** browser extension:

| Browser | Link |
|---------|------|
| Chrome / Brave | [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Edge | [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) |
| Other | [tampermonkey.net](https://www.tampermonkey.net/) |

### Install the Script

1. Open the [installation page](https://shalom-karr.github.io/redirector/) (hosted via GitHub Pages from `index.html`).
2. Click **Install Redirector Script** — a Tampermonkey confirmation tab will open.
3. Click **Install** to confirm.

### One-Time Browser Setup

Tampermonkey may need extra permissions depending on your browser:

- **Chrome / Brave** — Navigate to `chrome://extensions/?id=dhdgffkkebhmkfjojejmpbldmpobfkfo` and enable **Allow User Scripts**.
- **Edge** — Navigate to `edge://extensions/?id=iikmkjmpaadaobahmlepeloendndfphd` and ensure the Tampermonkey toggle is **On**.

See the installation page for screenshots and detailed instructions.

## Configuration

Redirect rules are defined in `REDIRECT_CONFIG` at the top of `redirector.user.js`:

```js
const REDIRECT_CONFIG = [
    { type: 'path', sourceDomain: 'forums.jtechforums.org', targetDomain: 'https://jtechwebsite.shalomkarr.workers.dev' },
    { type: 'path', sourceDomain: 'reddit.com', targetDomain: 'https://reddit2.sknews-139.workers.dev' },
    { type: 'youtube', sourceDomain: 'www.youtube.com', targetDomain: 'https://skyoutubebeta.netlify.app' }
];
```

| Field | Description |
|-------|-------------|
| `type` | `path` preserves the original URL path; `youtube` parses video/playlist/channel IDs |
| `sourceDomain` | The domain to match against |
| `targetDomain` | The base URL of the custom mirror site |

The fallback proxy is set via `PROXY_DOMAIN`.

## Repository Structure

```
├── index.html              # Installation & setup guide (GitHub Pages)
├── redirector.user.js      # The Tampermonkey userscript
├── chrome.png              # Chrome setup screenshot
├── edge.png                # Edge setup screenshot
└── README.md               # This file
```

## Author

Developed by **Shalom Karr / YH Studios**

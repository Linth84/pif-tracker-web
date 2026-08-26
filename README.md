# PIF Tracker — Web

Web version of **PIF Tracker**, built from the same HTML, CSS and JavaScript interface used by the current Android application.

## Features

- GS-441524 dose calculator
- Treatment records and notes
- 84-day treatment + 84-day observation tracking
- Spanish / English interface
- Light / dark theme
- Local persistence with `localStorage`
- Responsive mobile-first interface

## Run locally

No build step is required. Serve the folder with any static web server, for example VS Code Live Server, or open `index.html` directly for a quick test.

## Project structure

```text
pif-tracker-web/
├── assets/
├── favicon.ico
├── index.html
├── script.js
├── style.css
└── README.md
```

## Android relationship

The Android edition wraps this same web interface in an Android WebView. Android-only advertising hooks are guarded so the interface also runs normally in a standard browser.

## Disclaimer

PIF Tracker is a tracking and calculation aid and is not a substitute for professional veterinary advice.

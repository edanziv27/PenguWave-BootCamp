# PenguWave — Security Operations Dashboard

PenguWave is a frontend-only security operations dashboard built for the Upwind Bootcamp Frontend Track.

The project started as a basic security events table and was redesigned into a practical analyst workspace for triaging, filtering, investigating, and reviewing security events.

## Overview

PenguWave helps a SOC/security analyst quickly answer:

* What is happening right now?
* Which events are most severe?
* Which assets are most affected?
* Which events require investigation?
* Can I trust the quality of the event data?

The app is built as a dark, modern security-console interface with multiple analyst-focused views.

## What I Built

Main features:

* Dark, modern security operations UI
* Overview dashboard with visual summaries
* Insights tab with deterministic analyst signals
* Event Explorer with search, multi-select filters, sorting, pagination, and export
* Event details side panel for deeper investigation
* Data Quality tab for surfacing suspicious or messy records
* Users and Login pages with improved UI
* Settings page for personalizing dashboard behavior, notification preferences, and export preferences
* Ask AI placeholder assistant UI without real API calls

## Product Decisions

The main product decision was to turn PenguWave from a basic events table into a practical workspace for a SOC/security analyst.

Key decisions:

* I focused on the persona of a SOC analyst who starts a shift with many alerts and needs to quickly understand what matters most.
* I decided that the first screen should not be the raw events table, but a visual Overview that gives the analyst a quick understanding of severity, affected assets, common tags, and recent high-risk activity.
* I added an Insights tab to surface deterministic signals such as risky assets, repeated source IPs, common tags, duplicate-like records, and events that need attention.
* I kept the table inside an Event Explorer tab, making it the place for deeper investigation with search, multi-select filters, sorting, pagination, export, and row-level inspection.
* I added a side panel for event details so the analyst can investigate a specific event without losing the context of the table.
* I added a Data Quality tab because security analysts should not blindly trust incoming alert data. The dashboard surfaces missing fields, unknown IPs, future timestamps, duplicate-like records, empty descriptions, and suspicious payloads.
* I added Settings to support personalization, so each analyst can adjust dashboard behavior, notification preferences, default filters, sort order, compact mode, and export preferences according to their workflow.
* I added an Ask AI placeholder as a future-facing assistant concept, without connecting it to a real AI API or pretending that real AI analysis is already implemented.
* I prioritized trust, safety, and correctness before adding visual features, because a security dashboard must not mislead the analyst or render unsafe data.
* I redesigned the UI with a dark, dense, modern security-console style so the project feels closer to a real cybersecurity product rather than a starter app.

## Main Screens

### Overview

The Overview tab is the default landing experience.

It gives the analyst a quick mission-control view of the dataset, including:

* Total events
* Critical and high-severity events
* Data-quality issues
* External source IPs
* Severity distribution
* Top affected assets
* Recent critical/high activity
* Common tags

### Insights

The Insights tab provides deterministic, explainable signals based on the event data:

* Top risky assets
* Repeated source IPs
* Common tags
* Events that need attention
* Duplicate-like clusters

This tab is designed to help the analyst identify patterns without manually reading every row.

### Event Explorer

The Event Explorer is the main investigation workspace.

It includes:

* Free-text search
* Multi-select filters
* Sorting
* Pagination
* Active filter chips
* Export
* Compact security events table
* Event details side panel

Filtering behavior:

* Within the same category, filters work as OR
  Example: `HIGH` or `CRITICAL`
* Across different categories, filters work as AND
  Example: `severity = HIGH` and `tag = network`

### Data Quality

The Data Quality tab surfaces records that may be misleading, incomplete, duplicated, or suspicious.

It highlights:

* Future timestamps
* Missing fields
* Empty descriptions
* Unknown IPs
* Unusual hostnames
* Duplicate-like records
* Suspicious payloads

This was added as a product feature because security analysts should not blindly trust incoming alert data.

### Settings

The Settings page adds a personalization layer to the dashboard.

It allows the analyst to configure frontend preferences such as:

* Notification preferences for critical, high-severity, unknown-source, and data-quality events
* Default dashboard behavior, such as default severity filter and default sort order
* Compact table mode
* Whether to show data-quality warnings
* Export preferences, such as default export format and whether to include raw event data

These settings are stored locally in `localStorage`, so they persist in the same browser without requiring a backend.

The goal of this page is to make the dashboard feel more like a personalized analyst workspace rather than a static demo interface.

### Ask AI

Ask AI is a frontend-only placeholder assistant UI.

It suggests future investigation workflows such as:

* Summarizing critical events
* Finding suspicious patterns
* Explaining why an event matters
* Suggesting next investigation steps

No prompts are sent and no real AI API is called.

## Security and Correctness Fixes

Before adding new features, I reviewed the starter app and fixed several important issues:

* Removed unsafe HTML rendering / XSS risk
* Added support for `CRITICAL` severity
* Removed a hardcoded frontend secret
* Removed visible plaintext passwords
* Removed credential logging
* Improved login error handling
* Added safe handling for null, empty, unknown, duplicate, and future-timestamp records
* Hardened CSV export against formula injection
* Fixed lint/build issues

## Technical Flow

The app uses a predictable frontend data flow:

```text
raw events → filter → sort → paginate → display
```

The event data is loaded from:

```text
data/mock_events.json
```

The Events page controls the shared workspace state:

* selected tab
* search query
* selected filters
* sort order
* pagination
* selected event
* side panel state

The Overview, Insights, Event Explorer, and Data Quality tabs are different views over the same event dataset.

## Tech Stack

* React
* TypeScript
* Vite
* React Router
* CSS
* Mock JSON data

## Project Structure

```text
src/
  main.tsx              # React entry point
  App.tsx               # App shell, routes, navbar, login modal
  pages/                # Events, Users, Settings, NotFound
  components/           # UI components: tabs, table, badges, panels, filters
  types.ts              # Shared TypeScript types
  utils.ts              # Display, severity, timestamp, data-quality, CSV helpers
  eventQuery.ts         # Search, filtering, sorting, and faceting logic
  insights.ts           # Deterministic dashboard aggregations
  settings.ts           # Local dashboard/user preferences
  currentUser.ts        # Demo current user

data/
  mock_events.json      # Mock security events dataset
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The app runs locally at:

```text
http://localhost:5173
```

## Validation

The project was validated with:

```bash
npm run build
npm run lint
npm audit
```

Expected results:

* Build passes
* Lint passes
* Audit returns 0 vulnerabilities

## Limitations

This project is intentionally frontend-only.

Current limitations:

* No real backend
* No real authentication or authorization
* Events are loaded from static mock JSON
* Settings and personalization preferences are stored locally in `localStorage`
* Ask AI is a placeholder and does not call any AI API
* The current user is demo-only
* Data-quality and insight rules are deterministic heuristics

## Future Improvements

Given more time, I would add:

* Real backend integration
* Real authentication and role-based authorization
* Persisted user settings
* More advanced event correlation
* Tests for filtering, sorting, CSV export, and data-quality helpers
* Real AI-assisted investigation connected to a backend
* Better alert lifecycle management, such as acknowledge, assign, and resolve states

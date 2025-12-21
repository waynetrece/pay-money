# Project Status (SubPulse)

## Overview
- Static frontend dashboard for subscription reminders.
- No backend; all data is stored in localStorage.

## Current Features
- Sidebar navigation switches views (overview, subscriptions, payments, notifications).
- Summary cards (monthly total, annual total, next charge).
- Subscription table with monthly/yearly filter chips.
- Add/edit/delete subscriptions (modal form).
- Auto status calculation based on billing cycle + payment history:
  - Paid, Due (today), Upcoming, Overdue.
- USD -> TWD conversion with global rate (settings).
- Payment history CRUD (modal form + edit/delete in list).
- Reminder templates modal (editable, stored in settings).
- Export button downloads JSON (settings/subscriptions/payments).
- Theme toggle (light/dark) persisted in localStorage.

## Data & Persistence
- localStorage keys:
  - subpulse.subscriptions
  - subpulse.payments
  - subpulse.settings
- Settings include daily time, recipient email, USD rate, reminder templates.

## Primary Files
- index.html: layout and modals.
- styles.css: layout, cards, modals, table, actions.
- app.js: data logic, rendering, persistence, event handlers.

## How To Preview
- Open index.html directly in a browser, or
- Run: `python3 -m http.server` and visit `http://localhost:8000`.

## Known Gaps / TODO
- No backend/API integration.
- No real email or notification sending.
- Export only (no import).
- No validation for overlapping billing cycles beyond current logic.

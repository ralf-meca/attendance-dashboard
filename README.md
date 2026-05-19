# Attendance Dashboard

A personal Vue 3 dashboard for tracking work attendance and calculating monthly invoicing amounts. It aggregates data from two sources — **Company1** (via a CRM API) and **Company2** (via an intranet API) — and displays them side by side.

## Features

- Login with credentials stored in Pinia
- Monthly attendance view with a date picker (month/year)
- Stats widgets showing total hours worked and other summaries
- Tabbed attendance tables: **Company1** and **Company2**
- Configurable day rate selector to compute the total amount to invoice
- Built with Vue 3, PrimeVue, Chart.js, and Day.js

## Project Setup

```sh
npm install
```

### Development server

```sh
npm run dev
```

### Type-check, compile and minify for production

```sh
npm run build
```

### Lint

```sh
npm run lint
```
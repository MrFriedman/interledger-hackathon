# Bridging domestic work with open payments

This project aims to enable domestic job listings using Open Payments by providing a market place for potential employers and employees to match. The employer pays straight to the employees account after the day is done, helping low income individuals have a steadier source of income as they can get paid straight after the work day. This can allow them to buy food, transport or anything they need more frequently alleviating constant stress if they run out of money.

## Front-end demo

With `REACT_APP_API_URL` unset, the Create React App UI does not call Express or sqlite. It serves seeded job listings, employers, employees, and matches from the browser, and **Pay** runs a simulated Open Payments success flow. No environment variables are required to build or run that demo.

```bash
cd frontend
npm install
npm start
```

To use the Express API instead, set `REACT_APP_API_URL` (see `frontend/.env.example`) and run the backend with the variables in `backend/.env.example`.

## Deploying on Vercel

This repository is a front-end-only deploy. Recommended project settings:

| Setting | Value |
| --- | --- |
| Framework preset | Create React App |
| Root directory | `frontend` |
| Install command | `npm ci` (default) |
| Build command | `npm run build` (default) |
| Output directory | `build` (default) |
| Environment variables | none |

`frontend/vercel.json` rewrites every path to `index.html` so routes such as `/customer_home` survive a refresh.

Importing the repository with the root directory left as `.` also works. The root `vercel.json` installs and builds `frontend/` and applies the same SPA rewrite.

## Security

`backend/private (8).key` was committed earlier (commit `4136287`) together with hard-coded wallet address and key id values in `backend/index.js`. The file and those values are gone from the working tree, and key files are gitignored. **The key is still in git history and must be treated as burnt.** Do not reuse it. Rotate any Interledger test wallet that trusted it. This branch does not rewrite history; the deletion commit still shows the old secret, and clones of older commits still contain it.

Live Open Payments configuration is read only from environment variables (`OPEN_PAYMENTS_WALLET_ADDRESS_URL`, `OPEN_PAYMENTS_RECEIVING_WALLET_ADDRESS_URL`, `OPEN_PAYMENTS_KEY_ID`, and either `OPEN_PAYMENTS_PRIVATE_KEY_PATH` or `OPEN_PAYMENTS_PRIVATE_KEY`).

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (Node package manager, installed with Node.js)
- [SQLite3](https://www.sqlite.org/index.html) (for database management)

```bash
git clone git@github.com:NJW04/interledger-hackathon.git
cd interledger-hackathon
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Running The Frontend

```bash
npm start
```

### Running The Backend

```bash
cd ../backend
node database.js
node index.js
```

### Configuration

Ensure the frontend is set to communicate with the backend. Update the package.json file to include the proxy configuration for the Nodejs backend:

```bash
   "proxy": "http://localhost:5000"
```

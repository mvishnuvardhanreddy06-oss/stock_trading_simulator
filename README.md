# Stock Trading Simulator

A MERN-stack stock trading simulator that provides a realistic testing environment for placing buy/sell orders, tracking portfolio value, viewing transaction history, and observing simulated market price changes.

## Tech Stack

- MongoDB (Atlas) + Mongoose
- Express.js
- React (Vite)
- Node.js

## Quickstart (local)

1. Install dependencies for both Backend and Frontend:

```powershell
cd "Backend"
npm install
cd "..\Frontend"
npm install
```

2. Configure environment (copy and edit):

```powershell
cp Backend/.env.example Backend/.env
# Edit Backend/.env and Frontend env vars as needed
```

3. Start development servers (two terminals):

Backend:
```powershell
cd "Backend"
nodemon server.js
```

Frontend:
```powershell
cd "Frontend"
npm run dev
```

The API defaults to `http://localhost:5002` and the React app to `http://localhost:5173` (adjust `PORT` in `Backend/.env` if needed).

## Forgot Password / OTP

- OTP emails are sent using SMTP credentials set in `Backend/.env` (`EMAIL_USER`, `EMAIL_PASSWORD`).
- OTP expiry is currently set to 1 minute.

## Development notes

- Seed data and market simulation run automatically on backend startup.
- The project includes a lightweight market adapter and simulated order matching for demo purposes.

## Security

- Do not commit secrets. Ensure `.env` and any credentials are listed in `.gitignore` (already configured).

## Contributing

- Open an issue or submit a PR. Keep changes focused and add tests for critical logic.

## License

This repository does not include an explicit license file. Add one if you plan to open-source the project.

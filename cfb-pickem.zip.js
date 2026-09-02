/**
 * Auto‑build CFB Pick'em App
 * Upload this ONE file to GitHub.
 * Vercel will run it and generate the full project.
 */

import fs from "fs";
import path from "path";

const root = process.cwd();

// Create folders
["app", "components", "context", "data"].forEach(dir => {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
});

// package.json
fs.writeFileSync("package.json", `
{
  "name": "cfb-pickem",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "node cfb-pickem.zip.js && next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
`);

// next.config.mjs
fs.writeFileSync("next.config.mjs", `const nextConfig = {}; export default nextConfig;`);

// app/layout.jsx
fs.writeFileSync("app/layout.jsx", `
import "./globals.css";
import { UsernameProvider } from "../context/UsernameContext";
import { PicksProvider } from "../context/PicksContext";

export const metadata = {
  title: "CFB Pick'em",
  description: "College Football Pick'em"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UsernameProvider>
          <PicksProvider>
            {children}
          </PicksProvider>
        </UsernameProvider>
      </body>
    </html>
  );
}
`);

// app/globals.css
fs.writeFileSync("app/globals.css", `
body { margin: 0; font-family: sans-serif; background: #f3f3f3; }
.page { padding: 16px; }
.title { font-size: 20px; font-weight: bold; margin-bottom: 12px; }
.game-card { background: white; padding: 16px; border-radius: 12px; margin-bottom: 12px; }
button { background: #1a73e8; color: white; border: none; padding: 8px 12px; border-radius: 8px; }
input { width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ccc; }
`);

// app/dashboard/page.jsx
fs.writeFileSync("app/dashboard/page.jsx", `
import { games } from "../../data/games";
import GameCard from "../../components/GameCard";

export default function Dashboard() {
  return (
    <div className="page">
      <h1 className="title">CFB Saturday Picks</h1>
      {games.map(g => (
        <GameCard key={g.id} game={g} />
      ))}
    </div>
  );
}
`);

// app/username/page.jsx
fs.writeFileSync("app/username/page.jsx", `
"use client";
import { useContext, useState } from "react";
import { UsernameContext } from "../../context/UsernameContext";

export default function UsernamePage() {
  const { username, saveUsername } = useContext(UsernameContext);
  const [name, setName] = useState(username);

  return (
    <div className="page">
      <h1 className="title">Choose Username</h1>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => saveUsername(name)}>Save</button>
    </div>
  );
}
`);

// app/leaderboard/page.jsx
fs.writeFileSync("app/leaderboard/page.jsx", `
import Leaderboard from "../../components/Leaderboard";

const mockUsers = [
  { username: "Jay", bankroll: 950 },
  { username: "Sam", bankroll: 1020 },
  { username: "Alex", bankroll: 880 }
];

export default function LeaderboardPage() {
  return (
    <div className="page">
      <h1 className="title">Leaderboard</h1>
      <Leaderboard users={mockUsers} />
    </div>
  );
}
`);

// app/share/page.jsx
fs.writeFileSync("app/share/page.jsx", `
"use client";
import { useSearchParams } from "next/navigation";

export default function SharePage() {
  const params = useSearchParams();
  const raw = params.get("p");

  if (!raw) return <div className="page"><h1 className="title">Shared Picks</h1></div>;

  const data = JSON.parse(decodeURIComponent(raw));

  return (
    <div className="page">
      <h1 className="title">{data.username}'s Picks</h1>
      {Object.entries(data.picks).map(([gameId, pick]) => (
        <div key={gameId} className="game-card">
          <div>Game: {gameId}</div>
          <div>Team: {pick.team} — ${pick.risk}</div>
        </div>
      ))}
    </div>
  );
}
`);

// components/GameCard.jsx
fs.writeFileSync("components/GameCard.jsx", `
"use client";
import { useContext, useState } from "react";
import { PicksContext } from "../context/PicksContext";

export default function GameCard({ game }) {
  const { bankroll, picks, makePick } = useContext(PicksContext);
  const [risk, setRisk] = useState(50);
  const userPick = picks[game.id];

  return (
    <div className="game-card">
      <div>{game.away.name} @ {game.home.name}</div>
      <div>Spread: {game.home.name} {game.spread}</div>
      <input type="number" value={risk} onChange={e => setRisk(Number(e.target.value))} />
      <button onClick={() => makePick(game.id, game.home.name, risk)}>Pick {game.home.name}</button>
      <button onClick={() => makePick(game.id, game.away.name, risk)}>Pick {game.away.name}</button>
      {userPick && <div>Your pick: {userPick.team} (${userPick.risk})</div>}
      <div>Bankroll: ${bankroll}</div>
    </div>
  );
}
`);

// components/Leaderboard.jsx
fs.writeFileSync("components/Leaderboard.jsx", `
export default function Leaderboard({ users }) {
  return (
    <div className="game-card">
      <div>Leaderboard</div>
      {users.map((u, i) => (
        <div key={u.username}>{i + 1}. {u.username} — ${u.bankroll}</div>
      ))}
    </div>
  );
}
`);

// context/UsernameContext.jsx
fs.writeFileSync("context/UsernameContext.jsx", `
"use client";
import { createContext, useState } from "react";

export const UsernameContext = createContext();

export const UsernameProvider = ({ children }) => {
  const [username, setUsername] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("cfb_username") || ""
      : ""
  );

  const saveUsername = (name) => {
    setUsername(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("cfb_username", name);
    }
  };

  return (
    <UsernameContext.Provider value={{ username, saveUsername }}>
      {children}
    </UsernameContext.Provider>
  );
};
`);

// context/PicksContext.jsx
fs.writeFileSync("context/PicksContext.jsx", `
"use client";
import { createContext, useState } from "react";

export const PicksContext = createContext();

export const PicksProvider = ({ children }) => {
  const [bankroll, setBankroll] = useState(1000);
  const [picks, setPicks] = useState({});

  const makePick = (gameId, team, risk) => {
    if (risk <= 0 || risk > bankroll) return;
    setPicks(prev => ({ ...prev, [gameId]: { team, risk } }));
    setBankroll(prev => prev - risk);
  };

  return (
    <PicksContext.Provider value={{ bankroll, picks, makePick }}>
      {children}
    </PicksContext.Provider>
  );
};
`);

// data/games.js
fs.writeFileSync("data/games.js", `
export const games = [
  {
    id: "indiana-unt",
    home: { name: "Indiana", color: "#990000" },
    away: { name: "North Texas", color: "#00853e" },
    spread: -7.5
  },
  {
    id: "alabama-ecu",
    home: { name: "Alabama", color: "#9e1b32" },
    away: { name: "East Carolina", color: "#592a8a" },
    spread: -20.5
  }
];
`);

console.log("CFB Pick'em app generated.");

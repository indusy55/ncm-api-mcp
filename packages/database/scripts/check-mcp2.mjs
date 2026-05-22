import Database from "better-sqlite3";
const db = new Database("../../apps/mcp-server/data/mcp-server.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log("Tables:", tables.length ? tables.map(t => t.name).join(", ") : "NONE");
if (tables.length === 0) {
  const filename = db.name;
  console.log("DB path:", filename);
}
db.close();

import Database from "better-sqlite3";
const db = new Database("../../apps/platform/data/platform.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("tables:", tables.length);
const keys = db.prepare("SELECT id, name FROM api_keys LIMIT 3").all();
console.log("keys:", keys.length, JSON.stringify(keys));
db.close();

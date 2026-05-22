import { resolve } from "path";
console.log("CWD:", process.cwd());
console.log("Resolved platform.db:", resolve("../platform/data/platform.db"));

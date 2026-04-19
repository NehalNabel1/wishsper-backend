import app from "../server.js";
import { connectDB } from "../config/db.js";

await connectDB();

export default app;

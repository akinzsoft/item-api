import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { router } from "./routes";
import { pool } from "./db";

dotenv.config();

const app = express();
app.use(express.json());
app.use(router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: "internal server error" });
});

const port = Number(process.env.PORT) || 3000;

async function start() {
  await pool.query("SELECT 1");
  app.listen(port, () => console.log(`listening on port ${port}`));
}

start().catch((err) => {
  console.error("failed to start server:", err.message);
  process.exit(1);
});

import express, { Request, Response, NextFunction } from "express";
import { router } from "./routes";
import { pool } from "./db";

const app = express();
app.use(express.json());
app.use(router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.status ?? err.statusCode ?? 500;
  const message = status < 500 ? err.message : "internal server error";
  res.status(status).json({ success: false, error: message });
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

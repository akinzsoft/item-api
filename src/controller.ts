import { Request, Response } from "express";
import { pool } from "./db";
import { Item } from "./types";
import { ResultSetHeader, RowDataPacket } from "mysql2";

function parseId(req: Request, res: Response): number | null {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ success: false, error: "id must be an integer" });
    return null;
  }
  return id;
}

export async function createItem(req: Request, res: Response) {
  const { name, description } = req.body ?? {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ success: false, error: "name is required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query<ResultSetHeader>(
      "INSERT INTO items (name, description) VALUES (?, ?)",
      [name, description ?? null]
    );

    const [rows] = await conn.query<(Item & RowDataPacket)[]>(
      "SELECT * FROM items WHERE id = ?",
      [result.insertId]
    );

    await conn.commit();
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listItems(req: Request, res: Response) {
  const [rows] = await pool.query<(Item & RowDataPacket)[]>("SELECT * FROM items");
  res.status(200).json({ success: true, data: rows });
}

export async function getItem(req: Request, res: Response) {
  const id = parseId(req, res);
  if (id === null) return;

  const [rows] = await pool.query<(Item & RowDataPacket)[]>(
    "SELECT * FROM items WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: "item not found" });
  }

  res.status(200).json({ success: true, data: rows[0] });
}

export async function updateItem(req: Request, res: Response) {
  const id = parseId(req, res);
  if (id === null) return;

  const { name, description } = req.body ?? {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ success: false, error: "name is required" });
  }

  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE items SET name = ?, description = ? WHERE id = ?",
    [name, description ?? null, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, error: "item not found" });
  }

  const [rows] = await pool.query<(Item & RowDataPacket)[]>(
    "SELECT * FROM items WHERE id = ?",
    [id]
  );

  res.status(200).json({ success: true, data: rows[0] });
}

export async function deleteItem(req: Request, res: Response) {
  const id = parseId(req, res);
  if (id === null) return;

  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM items WHERE id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, error: "item not found" });
  }

  res.status(200).json({ success: true, data: { id } });
}

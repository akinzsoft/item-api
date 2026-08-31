import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { createItem, listItems, getItem, updateItem, deleteItem } from "./controller";

export const router = Router();

const wrap = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/items", wrap(createItem));
router.get("/items", wrap(listItems));
router.get("/items/:id", wrap(getItem));
router.put("/items/:id", wrap(updateItem));
router.delete("/items/:id", wrap(deleteItem));

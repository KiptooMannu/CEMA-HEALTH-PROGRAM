import { Hono } from "hono";
import {
  createHealthProgram,
  listPrograms,
  getProgram,
  updateHealthProgram,
  removeProgram,
} from "./Programs.controller";

const router = new Hono();

router.post("/", createHealthProgram);
router.get("/", listPrograms);
router.get("/:id", getProgram);
router.put("/:id", updateHealthProgram);
router.delete("/:id", removeProgram);

export { router as programRouter };

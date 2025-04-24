import { Hono } from "hono";
import {
  createHealthProgram,
  listPrograms,
  getProgram,
  updateHealthProgram,
  removeProgram,
} from "./Programs.controller";
import { authMiddleware } from "../middlewares/authmiddlewares";

const router = new Hono();

router.use("*", authMiddleware);

router.post("/", createHealthProgram);
router.get("/", listPrograms);
router.get("/:id", getProgram);
router.put("/:id", updateHealthProgram);
router.delete("/:id", removeProgram);

export { router as programRouter };
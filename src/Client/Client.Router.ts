import { Hono } from "hono";
import {
  registerClient,
  getClient,
  searchClient,
  updateClientProfile,
  getClientProfile,
} from "./Client.controller";
import { authMiddleware } from "../middlewares/authmiddlewares";

const router = new Hono();

router.use("*", authMiddleware);

router.post("/", registerClient);
router.get("/search", searchClient);
router.get("/:id", getClient);
router.get("/:id/profile", getClientProfile);
router.put("/:id", updateClientProfile);

export { router as clientRouter };
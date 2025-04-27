import { Hono } from "hono";
import {
  createEnrollment,
  updateEnrollmentStatus,
  getClientPrograms,
  // getProgramClients,
} from "./Entrollment.controller";

const router = new Hono();

// Create a new enrollment
router.post("/", createEnrollment);

// Update enrollment status
router.put("/:id", updateEnrollmentStatus);

// Get programs for a specific client
router.get("/client/:clientId", getClientPrograms);

// // Get clients for a specific program
// router.get("/program/:programId", getProgramClients);

export { router as enrollmentRouter };

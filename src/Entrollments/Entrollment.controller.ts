import { Context } from "hono";
import {
  enrollClient,
  updateEnrollment,
  getClientEnrollments,
  getProgramEnrollments,
} from "./Entrollments.service";
import { ApiResponse } from "../utils/apiResponse";

// Create a new enrollment
export const createEnrollment = async (c: Context) => {
  try {
    const enrollmentData = await c.req.json();
    const newEnrollment = await enrollClient({
      ...enrollmentData,
      createdBy: c.get("userId"), // Assuming userId is set in the request context
    });
    return c.json(ApiResponse.success(newEnrollment, "Client enrolled successfully"), 201);
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 400);
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (c: Context) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(ApiResponse.error("Invalid enrollment ID"), 400);
    }

    const { status, notes } = await c.req.json();
    const updatedEnrollment = await updateEnrollment(id, { status, notes });

    if (!updatedEnrollment) {
      return c.json(ApiResponse.error("Enrollment not found"), 404);
    }

    return c.json(ApiResponse.success(updatedEnrollment, "Enrollment updated successfully"));
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

// Get enrollments by client ID
export const getClientPrograms = async (c: Context) => {
  try {
    const clientId = parseInt(c.req.param("clientId"));
    if (isNaN(clientId)) {
      return c.json(ApiResponse.error("Invalid client ID"), 400);
    }

    const enrollments = await getClientEnrollments(clientId);
    return c.json(ApiResponse.success(enrollments));
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

// Get enrollments by program ID
export const getProgramClients = async (c: Context) => {
  try {
    const programId = parseInt(c.req.param("programId"));
    if (isNaN(programId)) {
      return c.json(ApiResponse.error("Invalid program ID"), 400);
    }

    const enrollments = await getProgramEnrollments(programId);
    return c.json(ApiResponse.success(enrollments));
  } catch (error: any) {
    return c.json(ApiResponse.error(error.message), 500);
  }
};

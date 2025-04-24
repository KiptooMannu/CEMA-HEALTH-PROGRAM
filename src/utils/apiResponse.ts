export class ApiResponse {
    static success(data: any, message: string = 'Success') {
      return {
        success: true,
        message,
        data,
      };
    }
  
    static error(message: string, errors: any = null) {
      return {
        success: false,
        message,
        errors,
      };
    }
  
    static paginated(data: any, total: number, page: number, limit: number) {
      return {
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  }



  export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    
    constructor(
      statusCode: number,
      message: string,
      isOperational: boolean = true
    ) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      
      // Maintains proper stack trace for where our error was thrown
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class BadRequestError extends ApiError {
    constructor(message: string = "Bad Request") {
      super(400, message);
    }
  }
  
  export class UnauthorizedError extends ApiError {
    constructor(message: string = "Unauthorized") {
      super(401, message);
    }
  }
  
  export class ForbiddenError extends ApiError {
    constructor(message: string = "Forbidden") {
      super(403, message);
    }
  }
  
  export class NotFoundError extends ApiError {
    constructor(message: string = "Not Found") {
      super(404, message);
    }
  }
  
  export class InternalServerError extends ApiError {
    constructor(message: string = "Internal Server Error") {
      super(500, message);
    }
  }
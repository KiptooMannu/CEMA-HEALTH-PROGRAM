export const config = {
    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiry: process.env.JWT_EXPIRY || "15m",  // string time format
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    
    // Validate that JWT_SECRET exists
    validate: () => {
      if (!config.jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
      }
    }
  };
  
  // Call validate to ensure configuration is correct
  config.validate();
  
  // Type for your config object
  export type Config = typeof config;
/**
 * Configuration service for managing environment variables and API settings
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  environment: "development" | "production" | "test";
}

class ConfigService {
  private config: ApiConfig;

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): ApiConfig {
    const environment = (process.env.NODE_ENV as ApiConfig["environment"]) || "development";
    
    return {
      baseUrl: this.getApiBaseUrl(),
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || "10000", 10),
      retries: parseInt(process.env.REACT_APP_API_RETRIES || "3", 10),
      environment
    };
  }

  private getApiBaseUrl(): string {
    // Check for explicit override first
    if (process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }

    // Use environment-specific URLs
    if (process.env.NODE_ENV === "production") {
      return process.env.REACT_APP_PRODUCTION_API_URL || "https://rpkconstruction.com/wp-json/estimate-calculator/v1/get-calculator-data";
    }
    
    // Default to development URL
    return process.env.REACT_APP_DEVELOPMENT_API_URL || "http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data";
  }



  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.environment === "development";
  }

  public isProduction(): boolean {
    return this.config.environment === "production";
  }

  public logConfiguration(): void {
    console.log("🔧 API Configuration:", {
      baseUrl: this.config.baseUrl,
      environment: this.config.environment,
      timeout: this.config.timeout,
      retries: this.config.retries
    });
  }
}

export const configService = new ConfigService();

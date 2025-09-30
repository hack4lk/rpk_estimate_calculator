import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { configService } from './config';

// Get API configuration
const API_CONFIG = configService.getConfig();

/**
 * Create and configure axios instance
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseUrl,
    timeout: API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Enable credentials for CORS requests
    withCredentials: false,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (API_CONFIG.environment === 'development') {
        console.log(`🚀 Making request to: ${config.url}`);
      }
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (API_CONFIG.environment === 'development') {
        console.log(`✅ Response received from: ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      if (error.code === 'ECONNABORTED') {
        console.error('❌ Request timeout');
      } else if (error.response) {
        console.error(`❌ HTTP Error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.error('❌ Network Error - No response received');
      } else {
        console.error('❌ Request setup error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  // Configure retry logic
  axiosRetry(instance, {
    retries: API_CONFIG.retries,
    retryDelay: (retryCount) => {
      console.log(`🔄 Retry attempt ${retryCount}`);
      return retryCount * 1000; // Exponential backoff: 1s, 2s, 3s...
    },
    retryCondition: (error) => {
      // Retry on network errors and 5xx status codes
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
             (error.response?.status ? error.response.status >= 500 : false);
    },
  });

  return instance;
};

// Create axios instance
export const axiosInstance = createAxiosInstance();

// Export axios types for use in other files
export type { AxiosResponse, AxiosError } from 'axios';

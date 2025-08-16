import { apiRequest } from "./queryClient";
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  Course, 
  Category,
  ApiResponse 
} from "@/types";

class ApiClient {
  private baseUrl = '/api';

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', `${this.baseUrl}/auth/login`, data);
    const result = await response.json();
    return result.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', `${this.baseUrl}/auth/register`, data);
    const result = await response.json();
    return result.data;
  }

  async logout(): Promise<void> {
    await apiRequest('POST', `${this.baseUrl}/auth/logout`);
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiRequest('POST', `${this.baseUrl}/auth/refresh`);
    const result = await response.json();
    return result.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await apiRequest('GET', `${this.baseUrl}/users/me`);
    const result = await response.json();
    return result.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await apiRequest('GET', `${this.baseUrl}/users`);
    const result = await response.json();
    return result.data;
  }

  // Course endpoints
  async getCourses(filters?: {
    category?: string;
    level?: string;
    language?: string;
    search?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Course[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiRequest('GET', `${this.baseUrl}/courses?${params}`);
    return await response.json();
  }

  async getCourse(id: number): Promise<Course> {
    const response = await apiRequest('GET', `${this.baseUrl}/courses/${id}`);
    const result = await response.json();
    return result.data;
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    const response = await apiRequest('POST', `${this.baseUrl}/courses`, data);
    const result = await response.json();
    return result.data;
  }

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const response = await apiRequest('PUT', `${this.baseUrl}/courses/${id}`, data);
    const result = await response.json();
    return result.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await apiRequest('DELETE', `${this.baseUrl}/courses/${id}`);
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await apiRequest('GET', `${this.baseUrl}/categories`);
    const result = await response.json();
    return result.data;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await apiRequest('POST', `${this.baseUrl}/categories`, data);
    const result = await response.json();
    return result.data;
  }
}

export const api = new ApiClient();

import AsyncStorage from "@react-native-async-storage/async-storage";
import { post } from "../api/axios";
import { TOKEN_KEY } from "../constants/auth";
import axios, { AxiosError } from "axios";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface ErrorResponse {
  error: string;
}

class UserService {
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await post<LoginResponse, LoginCredentials>(
        "/login",
        credentials
      );

      const token = response.data.token;
      await this.saveToken(token);
      return token;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Authentication failed");
    }
  }

  async register(credentials: RegisterCredentials): Promise<string> {
    try {
      const response = await post<LoginResponse, RegisterCredentials>(
        "/register",
        credentials
      );

      const token = response.data.token;
      await this.saveToken(token);
      return token;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Registration failed");
    }
  }

  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }
}

export default new UserService();

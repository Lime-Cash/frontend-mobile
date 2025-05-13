import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://localhost:3000";
const TOKEN_KEY = "@auth_token";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

class UserService {
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const token = response.data.token;
      await this.saveToken(token);
      return token;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || "Authentication failed");
      }
      throw error;
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

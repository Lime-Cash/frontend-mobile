import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000';
const TOKEN_KEY = '@auth_token';


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
          const response = await fetch(`${API_URL}/login`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              body: JSON.stringify(credentials),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Authentication failed');
          }

          const data: LoginResponse = await response.json();
          await this.saveToken(data.token);
          return data.token;
      } catch (error) {
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
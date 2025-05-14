import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_KEY } from "../constants/auth";
import { API_URL } from "../constants/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response: AxiosResponse<T> = await axiosInstance.get(url, config);
  return response;
}

export async function post<T, U>(
  url: string,
  body: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response: AxiosResponse<T> = await axiosInstance.post(
    url,
    body,
    config
  );
  return response;
}

export async function put<T, U>(
  url: string,
  body: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response: AxiosResponse<T> = await axiosInstance.put(url, body, config);
  return response;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
  return response;
}

export default axiosInstance;

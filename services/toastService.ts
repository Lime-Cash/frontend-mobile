import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

interface ToastParams {
  message: string;
  description?: string;
}

export const showToast = (
  type: ToastType,
  { message, description = "" }: ToastParams,
) => {
  Toast.show({
    type,
    text1: message,
    text2: description,
    position: "bottom",
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
};

export const showSuccessToast = (params: ToastParams) => {
  showToast("success", params);
};

export const showErrorToast = (params: ToastParams) => {
  showToast("error", params);
};

export const showInfoToast = (params: ToastParams) => {
  showToast("info", params);
};

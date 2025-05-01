import { useState } from "react";
import { KeyboardTypeOptions } from "react-native";

export type InputType = "text" | "email" | "password";

export function usePasswordField(type: InputType = "text") {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (type) {
      case "email":
        return "email-address";
      default:
        return "default";
    }
  };

  const getInputProps = () => {
    return {
      secureTextEntry: type === "password" && !isPasswordVisible,
      keyboardType: getKeyboardType(),
      autoCapitalize:
        type === "email"
          ? "none"
          : ((type === "password" ? "none" : "sentences") as
              | "none"
              | "sentences"
              | "words"
              | "characters"),
      autoCorrect: type !== "email" && type !== "password",
    };
  };

  return {
    isPasswordVisible,
    togglePasswordVisibility,
    getKeyboardType,
    getInputProps,
  };
}

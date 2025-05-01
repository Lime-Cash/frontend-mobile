import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import InputField from "../InputField";
import Button from "../Button";

export default function InputDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("El correo electrónico es requerido");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Formato de correo electrónico inválido");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("La contraseña es requerida");
      return false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      console.log("Formulario válido", { email, password });
      // Aquí podrías enviar los datos a tu backend
    }
  };

  return (
    <View style={styles.container}>
      <InputField
        label="Correo Electrónico"
        type="email"
        placeholder="Ingresa tu correo electrónico"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        onBlur={() => validateEmail(email)}
      />

      <InputField
        label="Contraseña"
        type="password"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChangeText={setPassword}
        error={passwordError}
        onBlur={() => validatePassword(password)}
      />

      <Button title="Iniciar Sesión" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
  },
});

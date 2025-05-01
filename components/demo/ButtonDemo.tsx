import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Button from "@/components/ui/Button";

export default function ButtonDemo() {
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Botones Estándar</Text>

      <Button
        title="Botón Primario"
        onPress={() => console.log("Botón primario presionado")}
        variant="filled"
        style={styles.buttonSpacing}
      />

      <Button
        title="Botón de Texto"
        onPress={() => console.log("Botón de texto presionado")}
        variant="text"
        style={styles.buttonSpacing}
      />

      <Text style={styles.sectionTitle}>Estados del Botón</Text>

      <Button
        title="Botón Deshabilitado"
        onPress={() => console.log("No debería ejecutarse")}
        disabled={true}
        style={styles.buttonSpacing}
      />

      <Button
        title="Botón con Carga"
        onPress={handlePress}
        loading={loading}
        style={styles.buttonSpacing}
      />

      <Text style={styles.sectionTitle}>Ancho Personalizado</Text>

      <Button
        title="Ancho 50%"
        onPress={() => console.log("Botón 50% presionado")}
        width="50%"
        style={styles.buttonSpacing}
      />

      <Button
        title="Ancho 200px"
        onPress={() => console.log("Botón 200px presionado")}
        width={200}
        style={styles.buttonSpacing}
      />

      <Text style={styles.sectionTitle}>Con Iconos</Text>

      <Button
        title="Botón con Icono"
        onPress={() => console.log("Botón con icono presionado")}
        icon="chevron.right"
        style={styles.buttonSpacing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
});

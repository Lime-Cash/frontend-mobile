import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface LimeLogoProps {
  size?: number;
  showText?: boolean;
}

export default function LimeLogo({
  size = 24,
  showText = true,
}: LimeLogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/lime.png")}
        style={[styles.logoImage, { width: size, height: size }]}
        resizeMode="contain"
      />
      {showText && <Text style={styles.logoText}>Lime Cash</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

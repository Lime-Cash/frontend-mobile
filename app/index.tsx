import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";

import Button from "@/components/ui/Button";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  const router = useRouter();

  const navigateToExplore = () => {
    router.push("/explore");
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Home</ThemedText>

      <View style={styles.buttonContainer}>
        <Button
          title="Filled Button"
          onPress={navigateToExplore}
          icon="paperplane.fill"
          variant="filled"
        />

        <Button title="Text Button" onPress={() => {}} variant="text" />
        <Button
          title="Text Button Icon"
          onPress={() => {}}
          variant="text"
          icon="paperplane.fill"
        />
        <Button
          title="Disabled Button"
          onPress={navigateToExplore}
          icon="paperplane.fill"
          variant="filled"
          disabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
});

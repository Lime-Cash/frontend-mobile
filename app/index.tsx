import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import InputDemo from "@/components/ui/demo/InputDemo";
import ButtonDemo from "@/components/ui/demo/ButtonDemo";

export default function HomeScreen() {
  const router = useRouter();

  const navigateToExplore = () => {
    router.push("/explore");
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>Home</ThemedText>

      <View style={styles.buttonContainer}>
        <InputDemo />
        <ButtonDemo />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 20,
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

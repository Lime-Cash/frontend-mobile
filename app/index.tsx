import { Redirect } from "expo-router";

export default function Index() {
  // Redirección simple al login
  return <Redirect href="/login" />;
}

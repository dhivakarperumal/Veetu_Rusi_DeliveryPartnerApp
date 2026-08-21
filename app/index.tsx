import { Redirect } from "expo-router";

// App entry point — always start at Login
export default function Index() {
  return <Redirect href="/src/Auth/LoginScreen" />;
}

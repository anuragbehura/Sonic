import { Text } from "react-native";
import { Lucide } from "@react-native-vector-icons/lucide";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background items-center justify-center px-6">
      <Lucide name="search" size={64} color="#333" />
      <Text className="text-title text-text-muted mt-4 text-center">Search coming soon</Text>
    </SafeAreaView>
  );
}
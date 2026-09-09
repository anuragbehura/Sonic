import { View, Text } from "react-native";
import { Search } from "lucide-react-native";

export default function SearchScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Search size={64} color="#333" />
      <Text className="text-title text-text-muted mt-4 text-center">Search coming soon</Text>
    </View>
  );
}
import { View } from "react-native";
import { MiniPlayer } from "./MiniPlayer";

export function TabLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ flex: 1 }}>
            {children}
            <MiniPlayer />
        </View>
    );
}
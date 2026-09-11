import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
} from "react-native";

import { MiniPlayer } from "./MiniPlayer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabBarWithMiniPlayerProps {
  state: any;
  descriptors: any;
  navigation: any;
  style?: any;
}

export function TabBarWithMiniPlayer({
  state,
  descriptors,
  navigation,
}: TabBarWithMiniPlayerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const tabCount = state.routes.length;
  const tabWidth = width / tabCount;

  return (
    <View
      style={{
        backgroundColor: "#0A0A0A",
      }}
    >
      {/* Mini Player */}
      <MiniPlayer />

      {/* Bottom Tab Bar */}
      <View
        style={{
          flexDirection: "row",
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: "#0A0A0A",
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title || route.name;

          const icon = options.tabBarIcon;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                width: tabWidth,
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityRole="button"
              accessibilityState={{
                selected: isFocused,
              }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              {icon &&
                icon({
                  focused: isFocused,
                  color: isFocused ? "#1DB954" : "#6B7280",
                  size: 24,
                })}

              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: isFocused ? "#1DB954" : "#6B7280",
                  marginTop: 4,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
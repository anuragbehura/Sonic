import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SplashLoading() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#208AEF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Image
        source={require('@/assets/images/splash-icon.png')}
        style={{ width: 76, height: 76, resizeMode: 'contain' }}
      />
    </View>
  );
}
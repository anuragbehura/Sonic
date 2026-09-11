import { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useToastStore } from "../../store/toastStore";

export function ToastHost() {
    const message = useToastStore((s) => s.message);
    const hide = useToastStore((s) => s.hide);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(hide, 2000);
        return () => clearTimeout(timer);
    }, [message, hide]);

    if (!message) return null;

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.85)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    text: { color: "white", fontSize: 14 },
});
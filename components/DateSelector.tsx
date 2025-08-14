import { getTheme } from "@/themes/theme";
import { StyleSheet, Text, useColorScheme } from "react-native";

export default function DateSelector() {
    const colorScheme = useColorScheme();
    const theme = getTheme(colorScheme);

    const today = new Date();
    const formatted = today.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Text style={[styles.dateText, { color: theme.colors.text, ...theme.fonts.medium }]}>
            {formatted}
        </Text>
    );
}

const styles = StyleSheet.create({
    dateText: {
        textAlign: "center",
        marginVertical: 12,
    },
});
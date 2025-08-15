import { getTheme } from "@/themes/theme";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface DateSelectorProps {
    date: Date;
    onDateChange: (date: Date) => void;
}

// Helper to compare dates without being affected by time
const areDatesOnSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

export default function DateSelector({ date, onDateChange }: DateSelectorProps) {
    const colorScheme = useColorScheme();
    const theme = getTheme(colorScheme);

    const isToday = areDatesOnSameDay(date, new Date());

    const handleDateChange = (newDate: Date) => {
        onDateChange(newDate);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const goToPreviousDay = () => {
        const previousDay = new Date(date);
        previousDay.setDate(date.getDate() - 1);
        handleDateChange(previousDay);
    };

    const goToNextDay = () => {
        if (!isToday) {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            handleDateChange(nextDay);
        }
    };

    const formatDateDisplay = (dateToFormat: Date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (areDatesOnSameDay(dateToFormat, today)) return "Today";
        if (areDatesOnSameDay(dateToFormat, yesterday)) return "Yesterday";
        
        return dateToFormat.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={goToPreviousDay} style={styles.arrowButton}>
                <Text style={[styles.arrow, { color: theme.colors.text }]}>‹</Text>
            </TouchableOpacity>
            
            <View style={styles.dateDisplay}>
                <Text style={[styles.dateText, { color: theme.colors.text, ...theme.fonts.medium }]}>
                    {formatDateDisplay(date)}
                </Text>
            </View>
            
            <TouchableOpacity 
                onPress={goToNextDay} 
                style={[styles.arrowButton, isToday && styles.disabledButton]}
                disabled={isToday}
            >
                <Text style={[styles.arrow, { color: isToday ? theme.colors.text + '40' : theme.colors.text }]}>
                    ›
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 6,
        paddingHorizontal: 16,
    },
    dateText: {
        textAlign: "center",
        fontSize: 18,
    },
    dateDisplay: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    arrowButton: {
        padding: 4,
        paddingHorizontal: 12,
    },
    arrow: {
        fontSize: 24,
        fontWeight: "bold",
    },
    disabledButton: {
        opacity: 0.3,
    },
});
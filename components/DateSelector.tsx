import { getTheme } from "@/themes/theme";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";

interface DateSelectorProps {
    onDateChange?: (date: Date) => void;
}

export default function DateSelector({ onDateChange }: DateSelectorProps) {
    const colorScheme = useColorScheme();
    const theme = getTheme(colorScheme);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const startDateRef = useRef<Date>(selectedDate);
    const lastDayDifference = useRef(0);
    const dayChangeThreshold = 30; // Pixels needed to change one day

    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate);
        onDateChange?.(newDate);
        // Haptic feedback on date change
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const goToPreviousDay = () => {
        const previousDay = new Date(selectedDate);
        previousDay.setDate(previousDay.getDate() - 1);
        handleDateChange(previousDay);
    };

    const goToNextDay = () => {
        if (!isToday()) {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            handleDateChange(nextDay);
        }
    };

    const formatDateDisplay = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time components for accurate comparison
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (dateOnly.getTime() === todayOnly.getTime()) {
            return "Today";
        } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    };

    const isToday = () => {
        const today = new Date();
        const dateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return dateOnly.getTime() === todayOnly.getTime();
    };

    const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        const { translationX } = event.nativeEvent;
        const dayDifference = Math.floor(translationX / dayChangeThreshold);

        if (dayDifference !== lastDayDifference.current) {
            let newDate = new Date(startDateRef.current);
            newDate.setDate(startDateRef.current.getDate() - dayDifference);

            // Don't allow future dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            newDate.setHours(0, 0, 0, 0);

            if (newDate > today) {
                newDate = today;
            }

            if (newDate.getTime() !== selectedDate.getTime()) {
                handleDateChange(newDate);
            }
            lastDayDifference.current = dayDifference;
        }
    };

    const onHandlerStateChange = (event: any) => {
        const { state } = event.nativeEvent;
        if (state === State.BEGAN) {
            startDateRef.current = selectedDate;
            lastDayDifference.current = 0;
        }
        if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
            lastDayDifference.current = 0;
        }
    };

    const formatted = formatDateDisplay(selectedDate);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={goToPreviousDay} style={styles.arrowButton}>
                <Text style={[styles.arrow, { color: theme.colors.text }]}>‹</Text>
            </TouchableOpacity>
            
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <View style={styles.swipeArea}>
                    <Text style={[styles.dateText, { color: theme.colors.text, ...theme.fonts.medium }]}>
                        {formatted}
                    </Text>
                </View>
            </PanGestureHandler>
            
            <TouchableOpacity 
                onPress={goToNextDay} 
                style={[styles.arrowButton, isToday() && styles.disabledButton]}
                disabled={isToday()}
            >
                <Text style={[
                    styles.arrow, 
                    { color: isToday() ? theme.colors.text + '40' : theme.colors.text }
                ]}>›</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 6,
    },
    dateText: {
        textAlign: "center",
        fontSize: 18,
    },
    swipeArea: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
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
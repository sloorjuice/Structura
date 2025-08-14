import { StyleSheet, Text } from "react-native";


export default function DateSelector() {
	const today = new Date();
	const formatted = today.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<Text style={styles.dateText}>{formatted}</Text>
	);
}

const styles = StyleSheet.create({
	dateText: {
		fontSize: 16,
		color: "#333",
		textAlign: "center",
		marginVertical: 12,
	},
});
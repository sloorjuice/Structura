import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';

type Props = {
	title: string;
};

export default function DailyCard({ title }: Props) {
	const [checked, setChecked] = useState(false);

	return (
		<View style={styles.container}>
			<Switch
				value={checked}
				onValueChange={setChecked}
				style={styles.checkbox}
			/>
			<Text style={styles.title}>{title}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		alignSelf: 'center',
		padding: 16,
		marginVertical: 8,
		borderRadius: 8,
		height: 60,
		backgroundColor: '#f0f0f0',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
        elevation: 3, // For Android shadow
		flexDirection: 'row',
		alignItems: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	checkbox: {
        marginRight: 12,
    },
});
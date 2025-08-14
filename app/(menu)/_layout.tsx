import { Stack } from 'expo-router';

export default function MenuLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: '#25292e'
				},
				headerShadowVisible: false,
				headerTintColor: '#fff',
			}}
		>
			<Stack.Screen name="projects" options={{ title: 'Projects' }} />
    		<Stack.Screen name="hobbies" options={{ title: 'Hobbies' }} />
		</Stack>
	);
}

import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';


export default function TabLayout() {
  return (
    <Tabs
		screenOptions={{
			tabBarActiveTintColor: '#ffd33d',
			headerStyle: {
				backgroundColor: '#25292e',
			},
			headerShadowVisible: false,
			headerTintColor: '#fff',
			headerTitleAlign: "center",
			tabBarStyle: {
				backgroundColor: '#25292e',
			},
		}}
	>
    	<Tabs.Screen 
			name="index" 
			options={{ 
				title: 'Daily Objectives',
				headerLeft: () => (
					<TouchableOpacity style={{ marginLeft: 16 }}>
						<Ionicons name="menu" size={28} color="#fff" />
					</TouchableOpacity>
				),
				headerRight: () => (
					<View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
					<Ionicons name="star" size={22} color="#ffd33d" style={{ marginRight: 6 }} />
					<Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>00</Text>
					</View>
				),
				tabBarIcon: ({ color, focused }) => (
					<Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
				),
			}} 
		/>
		<Tabs.Screen 
			name="profile" 
			options={{ 
				title: 'Profile', 
				headerLeft: () => (
					<TouchableOpacity style={{ marginLeft: 16 }}>
						<Ionicons name="menu" size={28} color="#fff" />
					</TouchableOpacity>
				),
				headerRight: () => (
					<View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
					<Ionicons name="star" size={22} color="#ffd33d" style={{ marginRight: 6 }} />
					<Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>00</Text>
					</View>
				),
				tabBarIcon: ({ color, focused }) => (
					<Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
				),
			}} 
		/>	
    </Tabs>
  );
}

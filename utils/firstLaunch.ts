import AsyncStorage from '@react-native-async-storage/async-storage';

export async function isFirstLaunch(): Promise<boolean> {
  const hasLaunched = await AsyncStorage.getItem('hasLaunched');
  if (hasLaunched === null) {
    await AsyncStorage.setItem('hasLaunched', 'true');
    return true;
  }
  return false;
}
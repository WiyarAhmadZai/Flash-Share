import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransferScreen } from './src/screens/TransferScreen';
import { PerfTestScreen } from './src/screens/PerfTestScreen';

export type RootStackParamList = {
  Home: undefined;
  Transfers: undefined;
  PerfTest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Transfers" component={TransferScreen} />
        <Stack.Screen name="PerfTest" component={PerfTestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

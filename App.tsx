import React, { useEffect } from 'react';
import { initTelemetry } from './src/modules/telemetry';
import * as Sentry from '@sentry/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransferScreen } from './src/screens/TransferScreen';
import { PerfTestScreen } from './src/screens/PerfTestScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Transfers: undefined;
  PerfTest: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Transfers" component={TransferScreen} />
        <Stack.Screen name="PerfTest" component={PerfTestScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const WrappedApp = Sentry.wrap(App);

const FinalApp: React.FC = () => {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initTelemetry();
      setIsReady(true);
    };
    initialize();
  }, []);

  if (!isReady) {
    return null; // Or a loading spinner
  }

  return <WrappedApp />;
};

export default FinalApp;


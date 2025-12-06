import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserConsent } from '../modules/telemetry';

export const SettingsScreen: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const loadPreference = async () => {
      const storedValue = await AsyncStorage.getItem('telemetry_opt_in');
      setIsEnabled(storedValue === 'true');
    };
    loadPreference();
  }, []);

  const handleToggle = (value: boolean) => {
    setIsEnabled(value);
    setUserConsent(value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.rowTitle}>Share Anonymous Data</Text>
              <Text style={styles.rowDescription}>
                Help improve FlashShare by sending anonymous crash reports and performance
                data. This includes your device model and OS version. No personal data or
                file contents are ever sent.
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#374151', true: '#22c55e' }}
              thumbColor={'#f4f3f4'}
              onValueChange={handleToggle}
              value={isEnabled}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050816' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  card: { backgroundColor: '#0b1120', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1f2933' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textContainer: { flex: 1, marginRight: 16 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#E5E5E5', marginBottom: 4 },
  rowDescription: { fontSize: 13, color: '#9CA3AF' },
});

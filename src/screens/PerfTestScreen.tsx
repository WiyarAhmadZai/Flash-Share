import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

// Mock test logic - replace with actual calls to a PerfTestEngine module
const runPerformanceTest = async (config: any) => {
  console.log('Starting performance test with config:', config);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        throughputMbps: Math.random() * (100 - 60) + 60, // Random value between 60 and 100
        averageLatency: Math.random() * (30 - 10) + 10, // Random value between 10 and 30
        retransmissions: Math.floor(Math.random() * 15),
      });
    }, 5000); // Simulate a 5-second test
  });
};

export const PerfTestScreen: React.FC = () => {
  const [testConfig, setTestConfig] = useState({
    bufferSizeMb: 20,
    chunkSizeKb: 512,
    concurrency: 3,
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTest = useCallback(async () => {
    setIsRunning(true);
    setTestResult(null);
    const result = await runPerformanceTest(testConfig);
    setTestResult(result);
    setIsRunning(false);
  }, [testConfig]);

  const renderConfigOption = (label: string, value: number, onDecrement: () => void, onIncrement: () => void) => (
    <View style={styles.configRow}>
      <Text style={styles.configLabel}>{label}</Text>
      <View style={styles.configControl}>
        <TouchableOpacity style={styles.controlButton} onPress={onDecrement}><Text style={styles.controlButtonText}>-</Text></TouchableOpacity>
        <Text style={styles.configValue}>{value}</Text>
        <TouchableOpacity style={styles.controlButton} onPress={onIncrement}><Text style={styles.controlButtonText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Performance Test</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuration</Text>
          {renderConfigOption('Buffer Size (MB)', testConfig.bufferSizeMb,
            () => setTestConfig(c => ({ ...c, bufferSizeMb: Math.max(1, c.bufferSizeMb - 1) })),
            () => setTestConfig(c => ({ ...c, bufferSizeMb: c.bufferSizeMb + 1 }))
          )}
          {renderConfigOption('Chunk Size (KB)', testConfig.chunkSizeKb,
            () => setTestConfig(c => ({ ...c, chunkSizeKb: Math.max(64, c.chunkSizeKb - 64) })),
            () => setTestConfig(c => ({ ...c, chunkSizeKb: c.chunkSizeKb + 64 }))
          )}
          {renderConfigOption('Concurrency', testConfig.concurrency,
            () => setTestConfig(c => ({ ...c, concurrency: Math.max(1, c.concurrency - 1) })),
            () => setTestConfig(c => ({ ...c, concurrency: Math.min(8, c.concurrency + 1) }))
          )}
        </View>

        <TouchableOpacity style={[styles.runButton, isRunning && styles.runButtonDisabled]} onPress={handleRunTest} disabled={isRunning}>
          <Text style={styles.runButtonText}>{isRunning ? 'Running Test...' : 'Start 10-Second Test'}</Text>
        </TouchableOpacity>

        {testResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Avg. Throughput</Text>
              <Text style={styles.resultValue}>{testResult.throughputMbps.toFixed(2)} Mbps</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Avg. Latency</Text>
              <Text style={styles.resultValue}>{testResult.averageLatency.toFixed(2)} ms</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Retransmissions</Text>
              <Text style={styles.resultValue}>{testResult.retransmissions}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050816' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  card: { backgroundColor: '#0b1120', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1f2933' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#E5E5E5', marginBottom: 12 },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  configLabel: { color: '#9CA3AF', fontSize: 15 },
  configControl: { flexDirection: 'row', alignItems: 'center' },
  controlButton: { backgroundColor: '#1f2933', borderRadius: 8, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  controlButtonText: { color: '#E5E5E5', fontSize: 18, fontWeight: 'bold' },
  configValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginHorizontal: 16, minWidth: 40, textAlign: 'center' },
  runButton: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  runButtonDisabled: { backgroundColor: '#166534' },
  runButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  resultLabel: { color: '#9CA3AF', fontSize: 15 },
  resultValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

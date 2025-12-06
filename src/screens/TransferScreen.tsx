import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatBytes, calculateMbps, formatEta } from '../utils/formatters';

// --- Mock Data and Types (replace with real state management) ---
type TransferStatus = 'queued' | 'in-progress' | 'completed' | 'failed' | 'paused';

interface TransferItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number; // 0-1
  status: TransferStatus;
  speedMbps: number;
  eta: string;
}

const MOCK_TRANSFERS: TransferItem[] = [
  {
    id: '1',
    fileName: 'document-final-v2.pdf',
    fileSize: 5 * 1024 * 1024,
    progress: 0.65,
    status: 'in-progress',
    speedMbps: 85.3,
    eta: '3s',
  },
  {
    id: '2',
    fileName: 'project-archive.zip',
    fileSize: 150 * 1024 * 1024,
    progress: 0.2,
    status: 'in-progress',
    speedMbps: 85.3,
    eta: '28s',
  },
  {
    id: '3',
    fileName: 'IMG_20231022.jpg',
    fileSize: 2.5 * 1024 * 1024,
    progress: 1,
    status: 'completed',
    speedMbps: 0,
    eta: '',
  },
];

export const TransferScreen: React.FC = () => {
  const [transfers, setTransfers] = useState<TransferItem[]>(MOCK_TRANSFERS);

  const renderTransferItem = ({ item }: { item: TransferItem }) => (
    <View style={styles.transferRow}>
      <View style={styles.transferHeader}>
        <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
        <Text style={styles.fileSize}>{formatBytes(item.fileSize)}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
      </View>
      <View style={styles.transferMeta}>
        <Text style={styles.metaText}>{(item.progress * 100).toFixed(0)}%</Text>
        <Text style={styles.metaText}>{item.status === 'in-progress' ? `${item.speedMbps.toFixed(1)} Mbps` : item.status}</Text>
        <Text style={styles.metaText}>{item.status === 'in-progress' ? `ETA: ${item.eta}` : ''}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Transfers</Text>

        <Text style={styles.sectionTitle}>Ongoing</Text>
        <FlatList
          data={transfers.filter(t => t.status === 'in-progress')}
          renderItem={renderTransferItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Completed</Text>
        <FlatList
          data={transfers.filter(t => t.status === 'completed')}
          renderItem={renderTransferItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Diagnostics</Text>
        <View style={styles.card}>
            <View style={styles.diagRow}>
                <Text style={styles.diagLabel}>Instant Throughput</Text>
                <Text style={styles.diagValue}>92.1 Mbps</Text>
            </View>
            <View style={styles.diagRow}>
                <Text style={styles.diagLabel}>10s Average</Text>
                <Text style={styles.diagValue}>88.4 Mbps</Text>
            </View>
            <View style={styles.diagRow}>
                <Text style={styles.diagLabel}>Parallel Streams</Text>
                <Text style={styles.diagValue}>3</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050816' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#E5E5E5', marginTop: 16, marginBottom: 8 },
  transferRow: { backgroundColor: '#0b1120', borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1f2933' },
  transferHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fileName: { fontSize: 15, fontWeight: '600', color: '#E5E5E5', flex: 1, marginRight: 8 },
  fileSize: { fontSize: 13, color: '#9CA3AF' },
  progressBarBackground: { height: 8, borderRadius: 4, backgroundColor: '#1F2937', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e' },
  transferMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metaText: { fontSize: 12, color: '#9CA3AF' },
  card: { backgroundColor: '#0b1120', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#1f2933' },
  diagRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  diagLabel: { color: '#9CA3AF', fontSize: 14 },
  diagValue: { color: '#E5E5E5', fontSize: 14, fontWeight: '600' },
});

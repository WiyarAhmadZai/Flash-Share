import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

type Device = {
  id: string;
  name: string;
};

type TransferStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

type Transfer = {
  id: string;
  filename: string;
  progress: number; // 0 - 1
  status: TransferStatus;
};

export const HomeScreen: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const startDiscovery = useCallback(() => {
    // TODO: Implement device discovery via Wi-Fi Direct / Multipeer / mDNS
    // For now, maybe stub a fake device list if needed
    setDevices([]);
  }, []);

  const connectToDevice = useCallback((id: string) => {
    // TODO: Implement connect logic
    console.log('connectToDevice', id);
  }, []);

  const pickFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      // TODO: Integrate with sendFile and actual transfer queue
      const newTransfers: Transfer[] = result.assets.map((asset, index) => ({
        id: `${Date.now()}-${index}`,
        filename: asset.name ?? 'Unknown file',
        progress: 0,
        status: 'pending'
      }));

      setTransfers(prev => [...newTransfers, ...prev]);
    } catch (error) {
      console.warn('pickFiles error', error);
    }
  }, []);

  const sendFile = useCallback((file: Transfer, device: Device) => {
    // TODO: Implement actual send logic (TCP / streams, resume, checksum, etc.)
    console.log('sendFile', { file, device });
  }, []);

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <View style={styles.deviceRow}>
      <View>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceSubtitle}>Tap connect to pair</Text>
      </View>
      <TouchableOpacity
        style={styles.deviceButton}
        onPress={() => connectToDevice(item.id)}
      >
        <Text style={styles.deviceButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransferItem = ({ item }: { item: Transfer }) => (
    <View style={styles.transferRow}>
      <View style={styles.transferHeader}>
        <Text style={styles.transferFilename} numberOfLines={1}>
          {item.filename}
        </Text>
        <Text style={styles.transferStatus}>{formatStatus(item.status)}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.round(item.progress * 100)}%` }
          ]}
        />
      </View>
      <Text style={styles.transferPercent}>
        {Math.round(item.progress * 100)}%
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>FlashShare</Text>
        <Text style={styles.subtitle}>
          Fast, simple device-to-device file sharing.
        </Text>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby devices</Text>
          <TouchableOpacity style={styles.chipButton} onPress={startDiscovery}>
            <Text style={styles.chipButtonText}>Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {devices.length === 0 ? (
            <Text style={styles.emptyText}>
              No devices found yet. Tap Scan to search.
            </Text>
          ) : (
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={renderDeviceItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={pickFiles}>
          <Text style={styles.primaryButtonText}>Select files</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transfers</Text>
        </View>

        <View style={[styles.card, styles.flexGrow]}>
          {transfers.length === 0 ? (
            <Text style={styles.emptyText}>
              Selected files will appear here as transfers.
            </Text>
          ) : (
            <FlatList
              data={transfers}
              keyExtractor={item => item.id}
              renderItem={renderTransferItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const formatStatus = (status: TransferStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in-progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816'
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    marginBottom: 16
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E5E5'
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#22c55e33',
    backgroundColor: '#22c55e1A'
  },
  chipButtonText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2933',
    marginBottom: 12
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5E5E5'
  },
  deviceSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  deviceButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#22c55e'
  },
  deviceButtonText: {
    color: '#0b1120',
    fontWeight: '600',
    fontSize: 13
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280'
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  primaryButtonText: {
    color: '#022c22',
    fontSize: 16,
    fontWeight: '700'
  },
  transferRow: {
    borderRadius: 10
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  transferFilename: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E5',
    marginRight: 8
  },
  transferStatus: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#1F2937',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#22c55e'
  },
  transferPercent: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },
  separator: {
    height: 10
  },
  flexGrow: {
    flex: 1
  }
});

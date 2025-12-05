import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { usePeerDiscovery, GenericPeer } from '../modules/usePeerDiscovery';
import { formatBytes } from '../utils/formatters';

type TransferStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

type Transfer = {
  id: string;
  filename: string;
  progress: number; // 0 - 1
  status: TransferStatus;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { peers, startDiscovery, connectTo } = usePeerDiscovery();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isReceiving, setIsReceiving] = useState(false); // Controls the modal
  const [incomingTransfer, setIncomingTransfer] = useState({ sender: 'PeerDevice-1', files: ['document.pdf', 'image.jpg'], totalSize: 1234567 });

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

      const sendFile = useCallback((file: Transfer, device: GenericPeer) => {
    // TODO: Implement actual send logic (TCP / streams, resume, checksum, etc.)
    console.log('sendFile', { file, device });
  }, []);

      const connectToDevice = useCallback((peerId: string) => {
    connectTo(peerId);
  }, [connectTo]);

    const renderDeviceItem = ({ item }: { item: GenericPeer }) => (
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isReceiving}
        onRequestClose={() => setIsReceiving(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Incoming Transfer</Text>
            <Text style={styles.modalText}>From: {incomingTransfer.sender}</Text>
            <Text style={styles.modalText}>Files: {incomingTransfer.files.join(', ')}</Text>
            <Text style={styles.modalText}>Total Size: {formatBytes(incomingTransfer.totalSize)}</Text>
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.declineButton]}
                onPress={() => setIsReceiving(false)}
              >
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={() => {
                  setIsReceiving(false);
                  // TODO: Add logic to accept transfer and navigate
                  navigation.navigate('Transfers');
                }}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
          {peers.length === 0 ? (
            <Text style={styles.emptyText}>
              No devices found yet. Tap Scan to search.
            </Text>
          ) : (
            <FlatList
              data={peers}
              keyExtractor={item => item.id}
              renderItem={renderDeviceItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={pickFiles}>
          <Text style={styles.primaryButtonText}>Select files</Text>
        </TouchableOpacity>

        {/* Navigation to Perf Test Screen */}
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('PerfTest')}>
          <Text style={styles.secondaryButtonText}>Performance Test</Text>
        </TouchableOpacity>

        {/* Manual trigger for the modal */}
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setIsReceiving(true)}>
            <Text style={styles.secondaryButtonText}>Simulate Incoming Transfer</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transfers</Text>
          <TouchableOpacity style={styles.chipButton} onPress={() => navigation.navigate('Transfers')}>
            <Text style={styles.chipButtonText}>View All</Text>
          </TouchableOpacity>
        </View>
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
  },
  secondaryButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#0b1120',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#1f2933',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 15 
  },
  modalText: { 
    marginBottom: 10, 
    textAlign: 'center', 
    color: '#E5E5E5' 
  },
  modalButtonRow: { 
    flexDirection: 'row', 
    marginTop: 20 
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  acceptButton: { 
    backgroundColor: '#22c55e' 
  },
  declineButton: { 
    backgroundColor: '#ef4444' 
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
});

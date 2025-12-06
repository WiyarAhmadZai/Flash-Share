import { Platform } from 'react-native';
import { useWifiP2p, Peer as WifiPeer } from './wifiP2p';
import { useMultipeer, Peer as MultipeerPeer } from './multipeer';

// A platform-agnostic peer type
export type GenericPeer = {
  id: string; // deviceAddress on Android, id on iOS
  name: string; // deviceName on Android, name on iOS
};

// This hook abstracts the platform-specific discovery logic
export const usePeerDiscovery = () => {
  if (Platform.OS === 'android') {
    const { peers, startDiscovery, connectTo } = useWifiP2p();

    // Adapt the Android-specific peer shape to the generic shape
    const genericPeers: GenericPeer[] = peers.map(peer => ({
      id: peer.deviceAddress,
      name: peer.deviceName,
    }));

    return {
      peers: genericPeers,
      startDiscovery,
      connectTo,
      // Add dummy functions for iOS-specific methods
      startAdvertising: () => {},
    };
  } else if (Platform.OS === 'ios') {
    const { peers, startAdvertising, startBrowsing, connectTo } = useMultipeer();

    // The iOS peer shape already matches the generic shape
    const genericPeers: GenericPeer[] = peers;

    return {
      peers: genericPeers,
      // On iOS, we need to both advertise and browse
      startDiscovery: () => {
        startAdvertising();
        startBrowsing();
      },
      connectTo,
      startAdvertising,
    };
  } else {
    // Fallback for other platforms (e.g., web)
    return {
      peers: [],
      startDiscovery: () => console.log('Discovery not supported on this platform'),
      connectTo: (id: string) => console.log('Connection not supported on this platform'),
      startAdvertising: () => {},
    };
  }
};

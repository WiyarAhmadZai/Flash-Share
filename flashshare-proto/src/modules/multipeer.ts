import { useState, useEffect, useCallback } from 'react';
import { Platform, NativeModules } from 'react-native';

const { MultipeerConnectivity } = NativeModules;

const SERVICE_TYPE = 'flashshare';

export type Peer = {
  id: string;
  name: string;
};

// A custom hook to manage Multipeer Connectivity functionality
export const useMultipeer = () => {
  const [peers, setPeers] = useState<Peer[]>([]);

  const updatePeers = useCallback(() => {
    MultipeerConnectivity.getAllPeers((allPeers: Peer[]) => {
      setPeers(allPeers);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    MultipeerConnectivity.on('peerFound', updatePeers);
    MultipeerConnectivity.on('peerLost', updatePeers);
    // TODO: Add listeners for connection events ('invite', 'peerConnected', etc.)

    return () => {
      MultipeerConnectivity.off('peerFound', updatePeers);
      MultipeerConnectivity.off('peerLost', updatePeers);
    };
  }, [updatePeers]);

  const startAdvertising = useCallback(() => {
    if (Platform.OS !== 'ios') return;
    MultipeerConnectivity.advertise(SERVICE_TYPE, { name: 'MyDevice' }); // Use a unique name
  }, []);

  const startBrowsing = useCallback(() => {
    if (Platform.OS !== 'ios') return;
    MultipeerConnectivity.browse(SERVICE_TYPE);
  }, []);

  const connectTo = useCallback((peerId: string) => {
    if (Platform.OS !== 'ios') return;
    MultipeerConnectivity.invite(peerId);
  }, []);

  // Note: The 'react-native-multipeer' library does not support streams or resource transfers.
  // This would need to be implemented manually using the broadcast/send methods.
  const sendResource = useCallback(async (filePath: string, progressCallback: (progress: number) => void) => {
    console.warn('sendResource is not implemented for iOS in this library.');
  }, []);

  return {
    peers,
    startAdvertising,
    startBrowsing,
    connectTo,
    sendResource,
  };
};

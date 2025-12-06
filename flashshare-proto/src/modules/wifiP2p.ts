import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  initialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  subscribeOnPeersUpdates,
  connect,
} from 'react-native-wifi-p2p';

// The library does not export this type, so we define it locally
export type Peer = {
  deviceAddress: string;
  deviceName: string;
  // Add other properties as needed from the library's output
};

// A custom hook to manage Wi-Fi P2P functionality
export const useWifiP2p = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (isInitialized) return;
      try {
        await initialize();
        setIsInitialized(true);

        const subscription = subscribeOnPeersUpdates(({ devices }: { devices: Peer[] }) => {
          console.log('Discovered Peers:', devices);
          setPeers(devices);
        });

        // TODO: Add listeners for connection status

        return () => {
          subscription?.remove();
        };
      } catch (e) {
        console.error('Initialization failed', e);
      }
    };

    const cleanup = init();

    return () => {
      // @ts-ignore
      cleanup.then(remove => remove && remove());
    };
  }, [isInitialized]);

  const startDiscovery = async () => {
    if (!isInitialized) {
      console.warn('WifiP2p is not initialized yet.');
      return;
    }
    if (Platform.OS !== 'android') return;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'FlashShare needs location access to discover nearby devices.',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted. Starting discovery...');
        await startDiscoveringPeers();
      } else {
        console.warn('Location permission denied.');
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  };

  const stopDiscovery = async () => {
    try {
      await stopDiscoveringPeers();
      console.log('Stopped peer discovery.');
    } catch (error) {
      console.error('Failed to stop discovery:', error);
    }
  };

  const connectTo = async (deviceAddress: string) => {
    try {
      await connect(deviceAddress);
      console.log(`Connection request sent to ${deviceAddress}`);
    } catch (error) {
      console.error(`Failed to connect to ${deviceAddress}:`, error);
    }
  };

  return {
    peers,
    startDiscovery,
    stopDiscovery,
    connectTo,
  };
};

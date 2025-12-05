import { useState, useEffect, useCallback } from 'react';
import Zeroconf, { Service } from 'react-native-zeroconf';
import TcpSocket from 'react-native-tcp-socket';

const SERVICE_TYPE = 'flashshare';
const DOMAIN = 'local.';
const DEFAULT_PORT = 12345;

// A custom hook to manage Zeroconf discovery and TCP transport
export const useZeroconfTransport = () => {
  const [discoveredServices, setDiscoveredServices] = useState<Service[]>([]);
  const zeroconf = new Zeroconf();

  useEffect(() => {
    zeroconf.on('found', (service: Service) => {
      console.log('Zeroconf service found:', service.fullName);
      // Add or update the service in our list
      setDiscoveredServices(prev => {
        const existing = prev.find(s => s.fullName === service.fullName);
        if (existing) {
          return prev.map(s => s.fullName === service.fullName ? service : s);
        }
        return [...prev, service];
      });
    });

    zeroconf.on('resolved', (service: Service) => {
        console.log('Zeroconf service resolved:', service.host, service.port);
        setDiscoveredServices(prev => 
            prev.map(s => s.fullName === service.fullName ? service : s)
        );
    });

    zeroconf.on('error', (err: Error) => {
      console.error('Zeroconf Error:', err);
    });

    return () => {
      zeroconf.stop();
      zeroconf.removeDeviceListeners();
    };
  }, []);

  const advertiseService = useCallback((name: string, port: number = DEFAULT_PORT) => {
    console.log(`Advertising service '${name}' on port ${port}`);
    zeroconf.publish(SERVICE_TYPE, DOMAIN, name, port);
  }, []);

  const browseServices = useCallback(() => {
    console.log('Browsing for Zeroconf services...');
    setDiscoveredServices([]);
    zeroconf.scan(SERVICE_TYPE, DOMAIN);
  }, []);

  const createServer = useCallback((port: number = DEFAULT_PORT, onConnection: (socket: TcpSocket.Socket) => void) => {
    const server = TcpSocket.createServer((socket) => {
      console.log('Server: Client connected from', socket.remoteAddress);
      onConnection(socket);

      socket.on('error', (error) => {
        console.error('Server: Socket error', error);
      });

      socket.on('close', () => {
        console.log('Server: Client disconnected');
      });
    });

    server.listen({ port, host: '0.0.0.0' }, () => {
      console.log(`TCP Server listening on port ${port}`);
    });

    return server; // Return the server instance so it can be closed later
  }, []);

  const connectToService = useCallback((service: Service, onConnected: (socket: TcpSocket.Socket) => void) => {
    console.log(`Connecting to ${service.host}:${service.port}`);
    const client = TcpSocket.createConnection({ port: service.port, host: service.host }, () => {
        console.log('Client: Connected to server');
        onConnected(client);
    });

    client.on('error', (error) => {
        console.error('Client: Connection error', error);
        // Simple retry logic: try again after 3 seconds
        setTimeout(() => {
            console.log('Client: Retrying connection...');
            connectToService(service, onConnected); 
        }, 3000);
    });

    return client;
  }, []);

  return {
    discoveredServices,
    advertiseService,
    browseServices,
    createServer,
    connectToService,
  };
};

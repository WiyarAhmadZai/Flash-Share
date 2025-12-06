/// <reference types="node" />
import { Platform } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import * as Crypto from 'expo-crypto';

// --- Wire Protocol for Handshake ---
const MESSAGE_SEPARATOR = '&&&';

type PublicKeyMessage = {
  type: 'PUBLIC_KEY';
  payload: { publicKey: string }; // base64 encoded public key
};

// --- Pseudo-code for ECDH ---
// This requires a library like 'react-native-quick-crypto'
// const crypto = require('crypto');

const generateEphemeralKeys = () => {
  // const ecdh = crypto.createECDH('curve25519');
  // ecdh.generateKeys();
  // return ecdh;
  console.warn('ECDH not implemented. Using dummy keys.');
  return { 
    getPublicKey: () => Buffer.from('dummy-public-key').toString('base64'),
    computeSecret: (otherKey: string) => Buffer.from('dummy-shared-secret-32-bytes-long'),
  };
};

// --- Handshake Logic ---

async function performHandshake(socket: TcpSocket.Socket, isInitiator: boolean): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const ecdh = generateEphemeralKeys();
    const myPublicKey = ecdh.getPublicKey();

    const onData = async (data: string | Buffer) => {
      const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const messageStr = bufferData.toString();
      if (messageStr.includes(MESSAGE_SEPARATOR)) {
        try {
          const msg = JSON.parse(messageStr.replace(MESSAGE_SEPARATOR, '')) as PublicKeyMessage;
          if (msg.type === 'PUBLIC_KEY') {
            socket.removeListener('data', onData);
            const theirPublicKey = msg.payload.publicKey;
            
            // Derive the shared secret
            const sharedSecret = ecdh.computeSecret(theirPublicKey);

            // Convert Buffer to ArrayBuffer for the crypto API
            const sharedSecretArrayBuffer = sharedSecret.buffer.slice(sharedSecret.byteOffset, sharedSecret.byteOffset + sharedSecret.byteLength);

            // In a real implementation, use HKDF to derive a key
            // For simplicity, we'll use the secret directly (if it's the right length)
            console.log('Handshake complete. Shared secret derived.');
            resolve(sharedSecretArrayBuffer);
          }
        } catch (e) {
          reject(new Error('Handshake failed: Invalid message'));
        }
      }
    };

    socket.on('data', onData);

    // Initiator sends their key first
    if (isInitiator) {
      const message: PublicKeyMessage = { type: 'PUBLIC_KEY', payload: { publicKey: myPublicKey } };
      socket.write(JSON.stringify(message) + MESSAGE_SEPARATOR);
    }
  });
}

export function startHandshakeAsInitiator(socket: TcpSocket.Socket): Promise<ArrayBuffer> {
  return performHandshake(socket, true);
}

export function startHandshakeAsResponder(socket: TcpSocket.Socket): Promise<ArrayBuffer> {
  return performHandshake(socket, false);
}

// --- Encryption Helpers (AES-256-GCM) ---

export async function encryptChunk(chunk: Buffer, key: ArrayBuffer): Promise<string> {
  const iv = Crypto.getRandomBytes(12);
  const data = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
  
  // Expo Crypto doesn't have a single sign method, so we simulate AES-GCM which includes authentication.
  // The authentication tag is part of the encrypted payload in GCM.
  const encrypted = await Crypto.encrypt(Crypto.CryptoEncoding.BASE64, data, {
    algorithm: 'AES-GCM',
    key: key,
    iv: iv,
  });

  return Buffer.from(iv).toString('base64') + '.' + encrypted;
}

export async function decryptChunk(data: string, key: ArrayBuffer): Promise<Buffer> {
  const [ivBase64, encryptedBase64] = data.split('.');
  if (!ivBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted payload format');
  }
  const iv = Buffer.from(ivBase64, 'base64');

  const decrypted = await Crypto.decrypt(Crypto.CryptoEncoding.BASE64, encryptedBase64, {
    algorithm: 'AES-GCM',
    key: key,
    iv: iv,
  });

  return Buffer.from(decrypted);
}

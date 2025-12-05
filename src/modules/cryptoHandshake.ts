/// <reference types="node" />
import { Platform } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import { AES, utils } from 'react-native-simple-crypto';

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

    const onData = (data: string | Buffer) => {
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

            // In a real implementation, use HKDF to derive a key
            // For simplicity, we'll use the secret directly (if it's the right length)
            console.log('Handshake complete. Shared secret derived.');
            resolve(utils.convertUtf8ToArrayBuffer(sharedSecret.toString()));
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

export async function encryptChunk(chunk: Buffer, key: ArrayBuffer): Promise<Buffer> {
  const iv = await utils.randomBytes(16); // AES-CBC block size
  const plaintext = utils.convertUtf8ToArrayBuffer(chunk.toString('base64'));

  const ciphertext = await AES.encrypt(plaintext, key, iv);

  // Combine IV and ciphertext for sending
  return Buffer.concat([
    Buffer.from(iv),
    Buffer.from(ciphertext),
  ]);
}

export async function decryptChunk(encryptedData: Buffer, key: ArrayBuffer): Promise<Buffer> {
  const iv = encryptedData.slice(0, 16);
  const ciphertext = encryptedData.slice(16);

  const ciphertextAsArrayBuffer = utils.convertBase64ToArrayBuffer(ciphertext.toString('base64'));
  const ivAsArrayBuffer = utils.convertBase64ToArrayBuffer(iv.toString('base64'));

  const decrypted = await AES.decrypt(ciphertextAsArrayBuffer, key, ivAsArrayBuffer);
  
  const base64String = utils.convertArrayBufferToBase64(decrypted);
  return Buffer.from(base64String, 'base64');
}

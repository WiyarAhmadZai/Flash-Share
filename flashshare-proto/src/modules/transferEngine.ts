import RNFS from 'react-native-fs';
import { SHA } from 'react-native-simple-crypto';
import TcpSocket from 'react-native-tcp-socket';

const DEFAULT_CHUNK_SIZE = 512 * 1024; // 512KB
const MESSAGE_SEPARATOR = '&&&';

// --- Type Definitions for Wire Protocol ---
type InitMessage = {
  type: 'INIT';
  payload: {
    fileName: string;
    fileSize: number;
    totalChunks: number;
    fileChecksum: string;
  };
};

type ChunkMessage = {
  type: 'CHUNK';
  payload: {
    sequence: number;
    checksum: string;
  };
};

type AckMessage = {
  type: 'ACK';
  payload: { sequence: number };
};

type FinMessage = { type: 'FIN' };
type ResumeRequestMessage = { type: 'RESUME_REQUEST'; payload: { fileName: string } };
type ResumeResponseMessage = { type: 'RESUME_RESPONSE'; payload: { sequence: number } };

type ControlMessage = InitMessage | ChunkMessage | AckMessage | FinMessage | ResumeRequestMessage | ResumeResponseMessage;

// --- Sender Logic ---

interface SendFileOptions {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
}

let isPaused = false;

export function pause() {
  isPaused = true;
}

export function resume() {
  isPaused = false;
}

export async function sendFile(filePath: string, socket: TcpSocket.Socket, options: SendFileOptions = {}) {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const onProgress = options.onProgress || (() => {});

  try {
    const stats = await RNFS.stat(filePath);
    const fileName = filePath.split('/').pop() || 'unknown';
    const fileSize = stats.size;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    const fileContent = await RNFS.readFile(filePath, 'base64');
    const fileChecksum = await SHA.sha256(fileContent);

    // 1. Send INIT message
    const initMessage: InitMessage = {
      type: 'INIT',
      payload: {
        fileName,
        fileSize,
        totalChunks,
        fileChecksum,
      },
    };
    socket.write(JSON.stringify(initMessage) + MESSAGE_SEPARATOR);

    let acknowledgedChunks = 0;

    // TODO: Implement resume logic by waiting for RESUME_RESPONSE here

    // 2. Send chunks
    for (let i = 0; i < totalChunks; i++) {
      if (isPaused) {
        await new Promise(resolve => {
            const check = setInterval(() => {
                if (!isPaused) {
                    clearInterval(check);
                    resolve(null);
                }
            }, 100);
        });
      }
      const chunk = await RNFS.read(filePath, chunkSize, i * chunkSize, 'base64');
      const chunkChecksum = await SHA.sha256(chunk);

      const chunkMessage: ChunkMessage = {
        type: 'CHUNK',
        payload: {
          sequence: i,
          checksum: chunkChecksum,
        },
      };

      // Send heaexp://172.16.0.14:8081der, then raw chunk data
      socket.write(JSON.stringify(chunkMessage) + MESSAGE_SEPARATOR);
      socket.write(Buffer.from(chunk, 'base64'));

      // Wait for ACK
      // In a real implementation, this would be a more robust queue with concurrency
      await new Promise<void>((resolve, reject) => {
        const onAck = (data: string | Buffer) => {
          const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
          const messageStr = bufferData.toString();
          if (messageStr.includes(MESSAGE_SEPARATOR)) {
            const rawMessages = messageStr.split(MESSAGE_SEPARATOR).filter(Boolean);
            for (const raw of rawMessages) {
              try {
                const msg = JSON.parse(raw) as ControlMessage;
                if (msg.type === 'ACK' && msg.payload.sequence === i) {
                  socket.removeListener('data', onAck);
                  acknowledgedChunks++;
                  onProgress(acknowledgedChunks / totalChunks);
                  resolve();
                  return;
                }
              } catch (e) { /* Ignore parsing errors */ }
            }
          }
        };
        socket.on('data', onAck);
        // Add a timeout for ACK
        setTimeout(() => {
          socket.removeListener('data', onAck);
          reject(new Error(`ACK timeout for chunk ${i}`));
        }, 10000); // 10 second timeout
      });
    }

    // 3. Send FIN message
    const finMessage: FinMessage = { type: 'FIN' };
    socket.write(JSON.stringify(finMessage) + MESSAGE_SEPARATOR);
    console.log('File transfer complete.');

  } catch (error) {
    console.error('File send error:', error);
    // TODO: Handle error, maybe close socket
  }
}

// --- Receiver Logic ---

interface ReceiverOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (filePath: string) => void;
}

export class FileReceiver {
  private socket: TcpSocket.Socket;
  private state: 'idle' | 'receiving' = 'idle';
  private fileHandle: any; // To store file metadata
  private receivedChunks = 0;
  private filePath = '';
  private buffer = '';
  private options: ReceiverOptions;

  constructor(socket: TcpSocket.Socket, options: ReceiverOptions = {}) {
    this.socket = socket;
    this.options = options;
    this.socket.on('data', this.handleData);
  }

  private handleData = async (data: string | Buffer) => {
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
    this.buffer += bufferData.toString();
    this.buffer += data.toString();

    // Process all complete messages in the buffer
    while (this.buffer.includes(MESSAGE_SEPARATOR)) {
      const messageEndIndex = this.buffer.indexOf(MESSAGE_SEPARATOR);
      const rawMessage = this.buffer.substring(0, messageEndIndex);
      this.buffer = this.buffer.substring(messageEndIndex + MESSAGE_SEPARATOR.length);

      try {
        const message = JSON.parse(rawMessage) as ControlMessage;
        await this.processMessage(message);
      } catch (e) {
        console.error('Failed to parse control message', e);
      }
    }
  };

  private processMessage = async (message: ControlMessage) => {
    if (message.type === 'INIT') {
      this.state = 'receiving';
      this.fileHandle = message.payload;
      this.filePath = `${RNFS.DocumentDirectoryPath}/${this.fileHandle.fileName}`;
      this.receivedChunks = 0;
      console.log('Receiving file:', this.fileHandle.fileName);
      // Ensure file is empty before starting
      await RNFS.writeFile(this.filePath, '', 'utf8');
    }

    if (message.type === 'CHUNK') {
      const { sequence, checksum } = message.payload;
      const chunkData = this.buffer.substring(0, DEFAULT_CHUNK_SIZE);
      this.buffer = this.buffer.substring(DEFAULT_CHUNK_SIZE);

      const receivedChecksum = await SHA.sha256(chunkData);

      if (receivedChecksum === checksum) {
        await RNFS.appendFile(this.filePath, chunkData, 'base64');
        this.receivedChunks++;
        this.options.onProgress?.(this.receivedChunks / this.fileHandle.totalChunks);

        const ack: AckMessage = { type: 'ACK', payload: { sequence } };
        this.socket.write(JSON.stringify(ack) + MESSAGE_SEPARATOR);
      } else {
        console.warn(`Checksum mismatch for chunk ${sequence}.`);
        // TODO: Send NACK
      }
    }

    if (message.type === 'RESUME_REQUEST') {
      if (this.state === 'receiving' && this.fileHandle.fileName === message.payload.fileName) {
        const response: ResumeResponseMessage = {
            type: 'RESUME_RESPONSE',
            payload: { sequence: this.receivedChunks }
        };
        this.socket.write(JSON.stringify(response) + MESSAGE_SEPARATOR);
      }
    }

    if (message.type === 'FIN') {
      console.log('FIN received. Verifying final file checksum...');
      const finalFileContent = await RNFS.readFile(this.filePath, 'base64');
      const finalChecksum = await SHA.sha256(finalFileContent);
      if (finalChecksum === this.fileHandle.fileChecksum) {
        console.log('File received successfully!');
        this.options.onComplete?.(this.filePath);
      } else {
        console.error('Final file checksum mismatch!');
      }
      this.state = 'idle';
    }
  };

  public cleanup = () => {
    this.socket.removeListener('data', this.handleData);
  };
}

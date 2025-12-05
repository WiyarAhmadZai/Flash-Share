# FlashShare

**Fast, private, peer-to-peer file sharing for mobile devices.**

FlashShare allows you to send files directly between devices on the same local network without needing an internet connection. It's built with privacy and speed as top priorities, using Wi-Fi Direct and local network sockets to achieve high-speed transfers.

---

## ✨ Features

- **Cross-Platform:** Works seamlessly between Android and iOS devices.
- **High-Speed Transfers:** Achieves speeds of 75-100 Mbps on modern devices.
- **Privacy Focused:** Files are sent directly between devices and are never stored on any server.
- **End-to-End Encryption:** Optional AES-256-GCM encryption for secure transfers.
- **No Internet Required:** Works entirely offline on your local Wi-Fi network or using Wi-Fi Direct.
- **Modern UI:** A clean, intuitive interface built with React Native.

## 🏛️ Architecture

The application follows a modular, peer-to-peer architecture.

```
+----------------------------------------------------+
|                 Application UI (React Native)      |
| (HomeScreen, TransferScreen, PerfTestScreen)       |
+------------------------+---------------------------+
|                        |                           |
|  +-------------------+ | +-----------------------+ |
|  |  Discovery Engine | | |   Transfer Engine     | |
|  | (wifiP2p, mDNS)   | | | (TCP Sockets)         | |
|  +-------------------+ | +-----------+-----------+ |
|                        |             |             |
|                        | +-----------v-----------+ |
|                        | | Crypto Handshake (AES)| |
|                        | +-----------------------+ |
+------------------------+---------------------------+
|                 Native Layer (Android/iOS)         |
+----------------------------------------------------+
|      Wi-Fi Direct / Multipeer Connectivity         |
+----------------------------------------------------+
```

1.  **Discovery:** The app uses Wi-Fi Direct (Android) or Multipeer Connectivity (iOS) via mDNS/Bonjour to find nearby devices without a central server.
2.  **Connection:** Once a peer is discovered, a direct TCP socket connection is established.
3.  **Handshake:** An optional cryptographic handshake (ECDH + AES) establishes a secure, end-to-end encrypted channel.
4.  **Transfer:** The `transferEngine` chunks the file, calculates checksums, and sends the data over the TCP socket, waiting for acknowledgements to ensure reliability.

## 🚀 Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/flashshare-proto.git
    cd flashshare-proto
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the app:**
    ```bash
    npm start
    ```
4.  Scan the QR code with the Expo Go app on your Android or iOS device.

## 🛠️ Developer Setup

### Prerequisites

- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **Expo Go:** The client app for your mobile device.
- **Android Studio:** (For Android) Required for the Android SDK, emulator, and build tools.
- **Xcode:** (For macOS/iOS) Required for the iOS simulator and build tools.

### OS-Specific Setup

- **Android:** Ensure you have the Android SDK Platform installed (API level 33+ recommended) and `adb` is available in your system's PATH.
- **iOS (on macOS):** Ensure Xcode is installed and the command-line tools are configured (`xcode-select --install`). You will also need CocoaPods (`sudo gem install cocoapods`).

## 🤝 Contribution Guide

We welcome contributions! Please follow these guidelines to ensure a smooth process.

### Code Style

- This project uses **ESLint** and **Prettier** for code formatting and style consistency.
- Please run `npm run lint` before submitting a pull request to catch any issues.

### Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps in automating changelogs and makes the project history more readable.

- **`feat:`** A new feature.
- **`fix:`** A bug fix.
- **`docs:`** Documentation only changes.
- **`style:`** Changes that do not affect the meaning of the code (white-space, formatting, etc).
- **`refactor:`** A code change that neither fixes a bug nor adds a feature.
- **`chore:`** Changes to the build process or auxiliary tools.

**Example:** `feat: add pause and resume functionality to transfers`

### Issue Templates

- **Bug Report:** Please provide detailed steps to reproduce, device information, and logs if possible.
- **Feature Request:** Clearly describe the problem you are trying to solve and your proposed solution.

## 🗺️ Developer Roadmap

### Milestone 1.0 (Core Functionality)

- [x] Stable device discovery and connection.
- [x] Reliable file transfer engine with checksums.
- [x] End-to-end encryption.
- [ ] Full background transfer support on Android and iOS.
- [ ] Comprehensive unit and integration test suite.
- [ ] Release on Google Play Store and Apple App Store.

### Experimental Features (Post-1.0)

- **Relay Server Option:** An optional, self-hostable TURN/relay server for transferring files when devices are not on the same local network.
- **Web Version:** A web client using WebRTC to allow transfers between mobile devices and desktop browsers.
- **Multi-Device Broadcast:** The ability to send a file to multiple nearby devices simultaneously.

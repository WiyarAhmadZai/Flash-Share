# FlashShare ⚡

FlashShare is a cross-platform peer-to-peer file transfer application built with React Native and Expo. The goal is to achieve high-speed, direct file sharing between Android and iOS devices without requiring an internet connection.

This repository contains the initial UI prototype.

## How to Run

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Expo development server:**
    ```bash
    npm start
    ```

3.  **Run on your device:**
    - Install the "Expo Go" app from the App Store or Google Play.
    - Scan the QR code from the terminal with the Expo Go app.

## Development Roadmap

- [ ] **Phase 1: UI Prototype (Complete)**
  - [x] Scaffold Expo application.
  - [x] Implement a polished, modern UI for device discovery, file selection, and transfer progress.
  - [x] Set up basic navigation.

- [ ] **Phase 2: Platform-Specific P2P Discovery & Connection**
  - [ ] Implement Android Wi-Fi Direct discovery (`react-native-wifi-p2p`).
  - [ ] Implement iOS Multipeer Connectivity (`react-native-multipeer-connectivity`).
  - [ ] Abstract platform-specific logic into a unified service.

- [ ] **Phase 3: Fallback Discovery & Core Transfer Logic**
  - [ ] Implement mDNS/Zeroconf discovery as a fallback (`react-native-zeroconf`).
  - [ ] Set up TCP sockets for file transfer (`react-native-tcp-socket`).
  - [ ] Implement file read/write logic (`react-native-fs`).

- [ ] **Phase 4: Advanced Features & Testing**
  - [ ] Add file transfer resume capabilities.
  - [ ] Implement optional AES encryption (`react-native-simple-crypto`).
  - [ ] Build a performance test harness to measure throughput.

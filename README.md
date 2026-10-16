# DuckPhone

DuckPhone is a Windows-oriented desktop prototype for exploring phone companion workflows: a device dashboard, dialer, contacts, messaging, notification center, and settings. It runs locally in Electron and includes realistic sample data so the interface can be evaluated without a phone.

## Important Bluetooth limitations

Bluetooth pairing does not grant an application universal access to a phone. Android and iOS do not expose contacts, SMS, call history, notification mirroring, or remote call control to an arbitrary PC application merely because the devices are paired. The Bluetooth profiles involved are also operating-system and device dependent. In particular, Web Bluetooth is a BLE GATT API; it is not an implementation of HFP, PBAP, MAP, A2DP, or AVRCP. iOS does not provide a general-purpose desktop API for these phone features.

Accordingly, this build does not claim that the sample phone is connected or that sample calls/messages are real. The Connect action attempts browser BLE discovery when supported and reports the result; the rest of the app is an interactive local demo. Genuine phone integration would require a supported OS-specific companion mechanism, native profile implementations, device permissions, and platform-specific validation. Some requested features cannot be provided under the no-phone-app requirement.

## Requirements

- Node.js 20 or newer
- npm
- Windows to create/run the NSIS installer, or Linux with Wine for a cross-build

## Run locally

```bash
npm install
npm run dev
```

The Vite UI runs in a browser for rapid development. To launch it inside Electron:

```bash
npm run electron:dev
```

## Build

```bash
npm run build
npm run dist:win
```

The Windows build uses electron-builder and writes the unpacked app and installer to `release/`. The app executable is `release/win-unpacked/DuckPhone.exe`; it must remain beside its Electron resources and DLLs. A successful NSIS build writes `release/DuckPhone-Setup-0.1.0.exe`.

The cross-platform build skips Windows executable resource editing and code signing. NSIS still requires Wine when building on Linux. This workspace's Linux container has no Wine, so it can produce the unpacked Windows app but cannot produce a usable installer here. The installer is unsigned; commercial distribution requires a trusted code-signing certificate and a Windows signing configuration.

## Architecture

- `src/`: React + TypeScript UI and local demo workflows.
- `electron/`: Electron main process and a narrow, context-isolated preload bridge.
- `vite.config.ts`: Vite, React, and Tailwind CSS integration.

The renderer has no Node.js access. Future transports should implement explicit, permission-aware capability adapters rather than assuming that Bluetooth pairing implies access to phone data.
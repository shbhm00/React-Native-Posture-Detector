# react-native-device-posture

A cross-platform React Native library for detecting foldable device posture,
fold state, and hinge changes on iOS and Android.

Detect whether a foldable device is closed, partially open, or fully open,
and build adaptive layouts for foldable and dual-screen devices.

Wrap your app once with `FoldStateProvider`, then read the same posture state from any screen using `useFoldState()`.

## Supported states

Both platforms emit the native listener `onFoldStateChange` and normalize it into a shared state shape.

| `status` | Meaning | `isFlat` |
|---|---|---|
| `unknown` | No hinge is available on this device | `false` |
| `closed` | Device is folded or closed | `false` |
| `partiallyOpen` | Device is in a mid-fold position | `false` |
| `fullyOpen` | Device is unfolded flat | `true` |

`isFlat` is only `true` when the device is fully open, which is the state you usually want for a wide dual-screen layout.

iOS reads `UIHinge` on iOS 27.1 and newer. Android reads Jetpack WindowManager `FoldingFeature`. Devices without a hinge stay at `unknown`.

Requires React Native 0.76 or newer with the New Architecture enabled.

## Installation

Install from npm:

```sh
npm install react-native-device-posture
```

Then install the iOS pods if you are building for iOS:

```sh
cd ios && pod install
```

Rebuild the native app after installation. A JavaScript reload alone is not enough.

## Usage

```jsx
import {
  FoldStateProvider,
  useFoldState,
  FOLD_STATE_EVENT,
  FOLD_STATUS,
} from 'react-native-device-posture';

function App() {
  return (
    <FoldStateProvider>
      <Root />
    </FoldStateProvider>
  );
}

function Home() {
  const { isFoldSupported, isFlat, status } = useFoldState();
  const isDuoOpen = isFoldSupported && isFlat;

  return isDuoOpen ? <WideHome /> : <PhoneHome />;
}
```

`FOLD_STATE_EVENT` is `'onFoldStateChange'` on both platforms. The provider subscribes to the native event for you, so screens generally only need to call `useFoldState()`.

`useFoldState()` throws if it is called outside `FoldStateProvider`.

## API

- `FoldStateProvider`: sets up native posture listening and exposes the current fold state to descendants.
- `useFoldState()`: reads the current state from context.
- `FOLD_STATE_EVENT`: native event name used by both platforms.
- `FOLD_STATUS`: status constants such as `unknown`, `closed`, `partiallyOpen`, and `fullyOpen`.

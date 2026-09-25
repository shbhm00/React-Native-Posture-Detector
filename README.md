# react-native-device-posture

One fold and hinge status for iOS and Android. Wrap the app once, then read the same state from any screen.

Both platforms emit the listener `onFoldStateChange`.

| `status` | Meaning | `isFlat` |
|---|---|---|
| `unknown` | This device has no hinge | `false` |
| `closed` | Folded | `false` |
| `partiallyOpen` | Mid-fold | `false` |
| `fullyOpen` | Unfolded flat | `true` |

`isFlat` is true only when the device is fully open. Use that for the wide Duo layout.

iOS reads `UIHinge` (iOS 27.1 and later). Android reads Jetpack WindowManager `FoldingFeature`. Phones without a hinge stay on `unknown`.

Requires React Native 0.76 or newer with the New Architecture enabled.

## Install

From the app:

```sh
npm install /Users/shubham/Documents/Learning/react-native-device-posture
cd ios && pod install
```

Rebuild the native app after installing. A JavaScript reload is not enough.

## Use

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

`FOLD_STATE_EVENT` is `'onFoldStateChange'` on both platforms. The provider already subscribes to it, so screens only need `useFoldState()`.

`useFoldState()` throws if it is called outside `FoldStateProvider`.

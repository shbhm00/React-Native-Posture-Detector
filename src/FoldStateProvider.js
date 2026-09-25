const React = require('react');
const { FOLD_STATE_EVENT } = require('./constants');
const { EMPTY_FOLD_STATE, normalizeFoldState } = require('./normalizeFoldState');

const FoldStateContext = React.createContext(null);

function readInitialState() {
  let NativeDevicePosture;
  try {
    NativeDevicePosture = require('./NativeDevicePosture').default;
  } catch (error) {
    return EMPTY_FOLD_STATE;
  }

  if (!NativeDevicePosture || typeof NativeDevicePosture.getFoldState !== 'function') {
    return EMPTY_FOLD_STATE;
  }

  return normalizeFoldState(NativeDevicePosture.getFoldState());
}

function FoldStateProvider({ children }) {
  const [foldState, setFoldState] = React.useState(readInitialState);

  React.useEffect(() => {
    let NativeDevicePosture;
    try {
      NativeDevicePosture = require('./NativeDevicePosture').default;
    } catch (error) {
      return undefined;
    }

    const listen = NativeDevicePosture && NativeDevicePosture[FOLD_STATE_EVENT];
    if (!NativeDevicePosture || typeof listen !== 'function') {
      return undefined;
    }

    NativeDevicePosture.startListening();
    const subscription = listen((next) => {
      setFoldState(normalizeFoldState(next));
    });

    return () => {
      subscription?.remove?.();
      NativeDevicePosture.stopListening?.();
    };
  }, []);

  return React.createElement(
    FoldStateContext.Provider,
    { value: foldState },
    children
  );
}

function useFoldState() {
  const foldState = React.useContext(FoldStateContext);
  if (foldState == null) {
    throw new Error(
      'useFoldState must be used within FoldStateProvider'
    );
  }
  return foldState;
}

module.exports = {
  FoldStateProvider,
  useFoldState,
};

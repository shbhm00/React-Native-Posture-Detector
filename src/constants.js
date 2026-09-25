/**
 * Same listener name on iOS and Android.
 * Subscribe with `nativeModule[FOLD_STATE_EVENT](handler)`.
 */
const FOLD_STATE_EVENT = 'onFoldStateChange';

const FOLD_STATUS = {
  UNKNOWN: 'unknown',
  CLOSED: 'closed',
  PARTIALLY_OPEN: 'partiallyOpen',
  FULLY_OPEN: 'fullyOpen',
};

module.exports = {
  FOLD_STATE_EVENT,
  FOLD_STATUS,
};

const { FOLD_STATUS } = require('./constants');

const KNOWN_STATUSES = new Set(Object.values(FOLD_STATUS));

const EMPTY_FOLD_STATE = {
  isFoldSupported: false,
  status: FOLD_STATUS.UNKNOWN,
  isFlat: false,
};

function normalizeFoldState(raw) {
  const isFoldSupported = Boolean(raw && raw.isFoldSupported);
  const status =
    raw && KNOWN_STATUSES.has(raw.status) ? raw.status : FOLD_STATUS.UNKNOWN;

  return {
    isFoldSupported,
    status: isFoldSupported ? status : FOLD_STATUS.UNKNOWN,
    isFlat: isFoldSupported && status === FOLD_STATUS.FULLY_OPEN,
  };
}

module.exports = {
  EMPTY_FOLD_STATE,
  normalizeFoldState,
};

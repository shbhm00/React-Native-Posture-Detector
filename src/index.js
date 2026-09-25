const { FOLD_STATE_EVENT, FOLD_STATUS } = require('./constants');
const { EMPTY_FOLD_STATE, normalizeFoldState } = require('./normalizeFoldState');
const { FoldStateProvider, useFoldState } = require('./FoldStateProvider');

module.exports = {
  FOLD_STATE_EVENT,
  FOLD_STATUS,
  EMPTY_FOLD_STATE,
  normalizeFoldState,
  FoldStateProvider,
  useFoldState,
};

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeFoldState } = require('../src/normalizeFoldState');
const { FOLD_STATUS } = require('../src/constants');

test('unknown devices stay closed to fold layout', () => {
  assert.deepEqual(normalizeFoldState(null), {
    isFoldSupported: false,
    status: FOLD_STATUS.UNKNOWN,
    isFlat: false,
  });
});

test('fully open hinge is the only flat posture', () => {
  assert.deepEqual(
    normalizeFoldState({
      isFoldSupported: true,
      status: FOLD_STATUS.FULLY_OPEN,
      isFlat: false,
    }),
    {
      isFoldSupported: true,
      status: FOLD_STATUS.FULLY_OPEN,
      isFlat: true,
    }
  );
});

test('partial and closed postures are not flat', () => {
  for (const status of [FOLD_STATUS.CLOSED, FOLD_STATUS.PARTIALLY_OPEN]) {
    const state = normalizeFoldState({
      isFoldSupported: true,
      status,
      isFlat: true,
    });
    assert.equal(state.status, status);
    assert.equal(state.isFlat, false);
  }
});

test('unsupported devices ignore a fully open status', () => {
  assert.deepEqual(
    normalizeFoldState({
      isFoldSupported: false,
      status: FOLD_STATUS.FULLY_OPEN,
      isFlat: true,
    }),
    {
      isFoldSupported: false,
      status: FOLD_STATUS.UNKNOWN,
      isFlat: false,
    }
  );
});

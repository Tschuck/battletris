module.exports = [
  // 4 in a row
  () => {
    const blck = { type: 1 };
    return [
      [ blck, blck, blck, blck, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
    ];
  },
  // L stone left
  () => {
    const blck = { type: 2 };
    return [
      [ blck, null, null, null, ],
      [ blck, blck, blck, null, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
    ];
  },
  // L stone right
  () => {
    const blck = { type: 3 };
    return [
      [ null, null, blck, null, ],
      [ blck, blck, blck, null, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
    ];
  },
  // blck
  () => {
    const blck = { type: 4 };
    return [
      [ blck, blck, null, null, ],
      [ blck, blck, null, null, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
    ];
  },
  // Z stone left
  () => {
    const blck = { type: 5 };
    return [
      [ null, blck, blck, null, ],
      [ blck, blck, null, null, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
    ];
  },
  // pyramide
  () => {
    const blck = { type: 6 };
    return [
      [ null, blck, null, null, ],
      [ blck, blck, blck, null, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
    ];
  },
  // Z stone right
  () => {
    const blck = { type: 7 };
    return [
      [ blck, blck, null, null, ],
      [ null, blck, blck, null, ],
      [ null, null, null, null, ],
      [ null, null, null, null, ],
    ];
  },
];

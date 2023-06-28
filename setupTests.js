// https://github.com/jsdom/jsdom/issues/3002

Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
});

Range.prototype.getClientRects = () => ({
  item: () => null,
  length: 0,
  [Symbol.iterator]: jest.fn(),
});

// scrollIntoView is not implemented in JSDOM, so we need to mock it.
// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = function () {};

function rIC(cb: () => void) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(cb);
  } else {
    setTimeout(cb, 1);
  }
}

export default rIC;

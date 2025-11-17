// success objects
export const successFalse = Object.freeze({
  success: false,
});
export const successTrue = Object.freeze({
  success: true,
});

// error objects
export const typeError = Object.freeze({
  type: "error",
});
// Now currently unused. The changed rationale is that it's up to the consumer to decide whether to consider the errors as warning or not depending on its own use cases.
export const typeWarning = Object.freeze({
  type: "warning",
});

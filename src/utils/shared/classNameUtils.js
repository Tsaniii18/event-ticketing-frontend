export const joinClasses = (...classes) =>
  classes.flat().filter(Boolean).join(" ");

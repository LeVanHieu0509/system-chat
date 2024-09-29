export const isShallowEqual = (obj1, obj2) => {
  for (let prop in obj1) {
    if (obj1[prop] !== obj2[prop]) return false;
  }

  for (let prop in obj2) {
    if (obj2[prop] !== obj1[prop]) return false;
  }

  return true;
};

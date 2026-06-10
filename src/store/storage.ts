const storage =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined"
    ? {
        getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
        setItem: (key: string, value: string) =>
          Promise.resolve(localStorage.setItem(key, value)),
        removeItem: (key: string) =>
          Promise.resolve(localStorage.removeItem(key)),
      }
    : {
        getItem: (_key: string) => Promise.resolve(null),
        setItem: (_key: string, _value: string) => Promise.resolve(),
        removeItem: (_key: string) => Promise.resolve(),
      };

export default storage;
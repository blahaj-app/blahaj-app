import { useEffect, useRef } from "react";

const usePreviousNotUndefined = <T>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    if (value !== undefined && value !== null) {
      ref.current = value;
    }
  }, [value]);

  return ref.current;
};

export default usePreviousNotUndefined;

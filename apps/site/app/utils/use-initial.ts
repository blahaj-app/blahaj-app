import { useRef } from "react";

const useInitial = <T>(value: T) => {
  const ref = useRef(value);
  return ref.current;
};

export default useInitial;

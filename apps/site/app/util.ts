export type SetStateType<T> = (value: T | ((value: T) => T)) => void;

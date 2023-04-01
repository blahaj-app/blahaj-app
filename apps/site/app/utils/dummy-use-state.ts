import type { Dispatch, SetStateAction } from "react";
import noop from "./noop";

export const dummyUseState = (initial: any): [any, Dispatch<SetStateAction<any>>] => [initial, noop];

import eases from "eases";
import type { Transition } from "framer-motion";

const defaultTransition: Transition = {
  type: "tween",
  duration: 0.5,
  ease: eases.cubicOut,
};

export default defaultTransition;

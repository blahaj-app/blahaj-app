import type { UseDisclosureReturn } from "@chakra-ui/react";
import noop from "./noop";

const noopDisclosure: UseDisclosureReturn = {
  isOpen: false,
  onOpen: noop,
  onClose: noop,
  onToggle: noop,
  isControlled: false,
  getButtonProps: noop,
  getDisclosureProps: noop,
};

export default noopDisclosure;

import { Button } from "@chakra-ui/react";
import type { FC, PropsWithChildren } from "react";

export type ItemSelectorButtonProps = PropsWithChildren<{
  active?: boolean;
  rounded?: "start" | "end" | "none" | "both";
  onClick: () => void;
}>;

const ItemSelectorButton: FC<ItemSelectorButtonProps> = ({ children, active = false, rounded, onClick }) => {
  return (
    <Button
      color={active ? "white" : "gray.600"}
      background={active ? "blahaj.600" : "white"}
      _hover={active ? { background: "blahaj.500" } : { background: "gray.100" }}
      _active={active ? { background: "blahaj.400" } : { background: "gray.200" }}
      borderWidth="2px"
      borderStyle="solid"
      borderColor="blackAlpha.300"
      roundedStart={rounded === "start" || rounded === "both" ? "full" : "none"}
      roundedEnd={rounded === "end" || rounded === "both" ? "full" : "none"}
      marginStart={rounded === "end" ? "-1px" : "0"}
      marginEnd={rounded === "start" || rounded === "both" ? "-1px" : "0"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default ItemSelectorButton;

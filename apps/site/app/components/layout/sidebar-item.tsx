import type { ButtonProps, ComponentWithAs } from "@chakra-ui/react";
import { Box, Button } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface SidebarItemProps extends ButtonProps {
  icon?: ReactNode;
  active?: boolean;
}

const SidebarItem: ComponentWithAs<"button", SidebarItemProps> = ({ icon, active = false, children, ...rest }) => {
  return (
    <Button
      variant="ghost"
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      px="4"
      py="3"
      height="unset"
      rounded="md"
      fontSize="lg"
      fontWeight="medium"
      background={active ? "blackAlpha.100" : "transparent"}
      color={active ? "black" : "gray.500"}
      _hover={{ background: "blackAlpha.50", color: "black" }}
      _active={{ background: "blackAlpha.100", color: "black" }}
      {...rest}
    >
      {icon}
      <Box ml="2">{children}</Box>
    </Button>
  );
};

export default SidebarItem;

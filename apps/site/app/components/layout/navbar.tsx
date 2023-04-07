import { Box, Flex } from "@chakra-ui/react";
import type { FC } from "react";
import { useLayoutContext } from "../../layout";
import blahajIcon from "../../media/blahaj.png";
import Hamburger from "./hamburger";

const Navbar: FC = () => {
  const { sidebar } = useLayoutContext();

  return (
    <Flex
      position="sticky"
      top="0"
      background="white"
      paddingY="2.5"
      paddingX="6"
      alignItems="center"
      justifyContent="space-between"
      shadow="md"
      zIndex="1020"
    >
      <Flex>
        <Box
          backgroundImage={blahajIcon}
          backgroundSize="contain"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          height="3rem"
          width="3rem"
          marginRight="0.5rem"
        />
        <Box as="h1" fontSize={32} fontWeight="bold" display={{ base: "none", sm: "inherit" }}>
          blahaj.app
        </Box>
      </Flex>
      <Flex>
        <Hamburger open={sidebar.isOpen} setOpen={sidebar.onOpen} />
      </Flex>
    </Flex>
  );
};

export default Navbar;

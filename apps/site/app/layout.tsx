import type { ButtonProps, ComponentWithAs } from "@chakra-ui/react";
import { Box, Button, Flex, VStack } from "@chakra-ui/react";
import { Link, Outlet, useLocation } from "@remix-run/react";
import eases from "eases";
import { AnimatePresence, motion } from "framer-motion";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { TbBrandGithub, TbMap2 } from "react-icons/tb";
import Hamburger from "./components/hamburger";
import { MotionBox } from "./components/motion-box";
import blahajIcon from "./media/blahaj.png";
import type { SetStateType } from "./util";
import { noop } from "./util";

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: SetStateType<boolean>;
}

export const LayoutContext = createContext<LayoutContextType>({
  sidebarOpen: false,
  setSidebarOpen: noop,
});

export const useLayoutContext = () => useContext(LayoutContext);

const Navbar: FC = () => {
  const { sidebarOpen, setSidebarOpen } = useLayoutContext();

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
        <Box fontSize={32} fontWeight="bold" display={{ base: "none", sm: "inherit" }}>
          blahaj.app
        </Box>
      </Flex>
      <Flex>
        <Hamburger open={sidebarOpen} setOpen={setSidebarOpen} />
      </Flex>
    </Flex>
  );
};

const Sidebar: FC<PropsWithChildren> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useLayoutContext();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <MotionBox
            as={motion.div}
            exit={{ translateX: "100%" }}
            animate={{ translateX: "0%" }}
            initial={{ translateX: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: eases.cubicOut }}
            position="fixed"
            bottom="0"
            right="0"
            width={{ base: "64", sm: "72" }}
            height="calc(100vh - 4.25rem)"
            zIndex="1010"
            background="white"
            shadow="lg"
          >
            <Flex as="ul" padding="2" flexDirection="column" height="100%" justifyContent="space-between">
              {children}
            </Flex>
          </MotionBox>
          <MotionBox
            exit={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.35, ease: eases.cubicOut }}
            background="blackAlpha.300"
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
            zIndex="1000"
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
};

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

const Layout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <Flex flexDirection="column" height="100vh">
        <Navbar />
        <Box position="relative" flexGrow="1">
          <Sidebar>
            <VStack alignItems="stretch" spacing="1">
              <SidebarItem as={Link} to="/blahaj/map" icon={<TbMap2 size="28" />} active>
                Store Map
              </SidebarItem>
            </VStack>
            <VStack alignItems="stretch" spacing="1">
              <SidebarItem
                as="a"
                href="https://github.com/repository/blahaj-app"
                target="_blank"
                icon={<TbBrandGithub size="28" />}
              >
                View on GitHub
              </SidebarItem>
            </VStack>
          </Sidebar>
          <Outlet />
        </Box>
      </Flex>
    </LayoutContext.Provider>
  );
};
export default Layout;
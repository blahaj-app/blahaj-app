import { Item } from "@blahaj-app/static";
import type { ButtonProps, ComponentWithAs, UseDisclosureReturn } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Box, Button, Flex, VStack } from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link, Outlet, useLocation } from "@remix-run/react";
import eases from "eases";
import { AnimatePresence, motion } from "framer-motion";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { useMemo } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { TbBrandGithub, TbMail, TbMap2 } from "react-icons/tb";
import { RemoveScroll } from "react-remove-scroll";
import { $path } from "remix-routes";
import Hamburger from "./components/hamburger";
import { MotionBox } from "./components/motion-box";
import blahajIcon from "./media/blahaj.png";
import matchesPaths from "./utils/matches-paths";
import noop from "./utils/noop";
import noopDisclosure from "./utils/noop-disclosure";
import type { SetStateType } from "./utils/types";

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: SetStateType<boolean>;
  contactModal: UseDisclosureReturn;
}

export const LayoutContext = createContext<LayoutContextType>({
  sidebarOpen: false,
  setSidebarOpen: noop,
  contactModal: noopDisclosure,
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
        <Box as="h1" fontSize={32} fontWeight="bold" display={{ base: "none", sm: "inherit" }}>
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
    <RemoveScroll enabled={sidebarOpen}>
      <AnimatePresence>
        {sidebarOpen && (
          <MotionBox
            exit={{ backgroundColor: "#00000000" }}
            animate={{ backgroundColor: "#00000029" }}
            initial={{ backgroundColor: "#00000000" }}
            transition={{ type: "tween", duration: 0.35, ease: eases.cubicOut }}
            position="fixed"
            top="0"
            bottom="0"
            left="0"
            right="0"
            zIndex="1000"
            overflow="hidden"
            onClick={() => setSidebarOpen(false)}
            onTouchMove={() => setSidebarOpen(false)}
          >
            <MotionBox
              as={motion.div}
              exit={{ translateX: "100%" }}
              animate={{ translateX: "0%" }}
              initial={{ translateX: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: eases.cubicOut }}
              position="absolute"
              top="4.25rem"
              bottom="0"
              right="0"
              width={{ base: "64", sm: "72" }}
              background="white"
              shadow="lg"
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <Flex as="ul" padding="2" flexDirection="column" height="100%" justifyContent="space-between">
                {children}
              </Flex>
            </MotionBox>
          </MotionBox>
        )}
      </AnimatePresence>
    </RemoveScroll>
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

const ContactModal: FC = () => {
  const { contactModal } = useLayoutContext();

  return (
    <Modal isOpen={contactModal.isOpen} onClose={contactModal.onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Contact</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Heading size="sm">Suggestions, bug reports, and errors</Heading>
          <Box as="p" lineHeight="1.25" marginTop="1">
            To avoid duplicates, and to allow others to comment and contribute, please submit all suggestions and bug
            reports to the{" "}
            <ChakraLink color="blue.400" href="https://github.com/repository/blahaj-app" target="_blank">
              issue tracker on GitHub
            </ChakraLink>
          </Box>
          <Heading size="sm" marginTop="6">
            Everything else
          </Heading>
          <Box as="p" lineHeight="1.25" marginTop="1">
            For everything else, you can contact me on{" "}
            <ChakraLink color="blue.400" href="https://discord.gg/TPmbJcMkeX" target="_blank">
              Discord
            </ChakraLink>{" "}
            or email me at{" "}
            <ChakraLink color="blue.400" href="mailto:contact@blahaj.app" target="_blank">
              contact@blahaj.app
            </ChakraLink>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            color="white"
            background="blahaj.600"
            _hover={{ background: "blahaj.500" }}
            _active={{ background: "blahaj.400" }}
            mr={3}
            onClick={contactModal.onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Layout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isMap = useMemo(
    () => matchesPaths(["/:item/map", "/:item/map/:storeId"], location.pathname),
    [location.pathname],
  );

  const contactModal = useDisclosure();

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, contactModal }}>
      <ContactModal />
      <Flex flexDirection="column" height="100vh" position="relative">
        <Navbar />
        <Sidebar>
          <VStack alignItems="stretch" spacing="1">
            <SidebarItem
              as={Link}
              to={$path("/:item/map", { item: Item.BLAHAJ })}
              icon={<TbMap2 size="28" />}
              active={isMap}
              onClick={(e) => {
                if (isMap) {
                  e.preventDefault();
                  setSidebarOpen(false);
                }
              }}
            >
              Store Map
            </SidebarItem>
          </VStack>
          <VStack alignItems="stretch" spacing="1">
            <SidebarItem as="a" href="https://discord.gg/TPmbJcMkeX" target="_blank" icon={<FaDiscord size="28" />}>
              Discord
            </SidebarItem>
            <SidebarItem
              as="button"
              icon={<TbMail size="28" />}
              onClick={() => {
                setSidebarOpen(false);
                contactModal.onOpen();
              }}
            >
              Contact
            </SidebarItem>
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
        <Box flexGrow="1">
          <Outlet />
        </Box>
      </Flex>
    </LayoutContext.Provider>
  );
};
export default Layout;

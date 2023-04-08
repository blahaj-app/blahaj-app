import { Item } from "@blahaj-app/static";
import type { UseDisclosureReturn } from "@chakra-ui/react";
import { Box, Flex, VStack, useDisclosure } from "@chakra-ui/react";
import { Link, Outlet, useLocation } from "@remix-run/react";
import type { FC } from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { FaDiscord } from "react-icons/fa";
import { TbBrandGithub, TbMail, TbMap2 } from "react-icons/tb";
import { $path } from "remix-routes";
import ContactModal from "./components/layout/contact-modal";
import Navbar from "./components/layout/navbar";
import Sidebar from "./components/layout/sidebar";
import SidebarItem from "./components/layout/sidebar-item";
import matchesPaths from "./utils/matches-paths";
import noopDisclosure from "./utils/noop-disclosure";

interface LayoutContextType {
  sidebar: UseDisclosureReturn;
  contactModal: UseDisclosureReturn;
}

export const LayoutContext = createContext<LayoutContextType>({
  sidebar: noopDisclosure,
  contactModal: noopDisclosure,
});

export const useLayoutContext = () => useContext(LayoutContext);

const Layout: FC = () => {
  const location = useLocation();

  const contactModal = useDisclosure();
  const sidebar = useDisclosure();

  useEffect(() => {
    sidebar.onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isMap = useMemo(
    () => matchesPaths(["/:item/map", "/:item/map/:storeId"], location.pathname),
    [location.pathname],
  );

  return (
    <LayoutContext.Provider value={{ sidebar, contactModal }}>
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
                  sidebar.onClose();
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
                sidebar.onClose();
                contactModal.onOpen();
              }}
            >
              Contact
            </SidebarItem>
            <SidebarItem
              as="a"
              href="https://github.com/blahaj-app/blahaj-app"
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

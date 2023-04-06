import { Flex } from "@chakra-ui/react";
import eases from "eases";
import { AnimatePresence, motion } from "framer-motion";
import type { FC, PropsWithChildren } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { useLayoutContext } from "../../layout";
import { MotionBox } from "../motion-box";

const Sidebar: FC<PropsWithChildren> = ({ children }) => {
  const { sidebar } = useLayoutContext();

  return (
    <RemoveScroll enabled={sidebar.isOpen}>
      <AnimatePresence>
        {sidebar.isOpen && (
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
            onClick={sidebar.onClose}
            onTouchMove={sidebar.onClose}
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

export default Sidebar;

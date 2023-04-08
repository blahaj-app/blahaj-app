import {
  Box,
  Button,
  Link as ChakraLink,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import type { FC } from "react";
import { useLayoutContext } from "../../layout";

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
            <ChakraLink color="blue.400" href="https://github.com/blahaj-app/blahaj-app" target="_blank">
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

export default ContactModal;

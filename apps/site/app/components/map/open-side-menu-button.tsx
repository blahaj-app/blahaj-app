import { Link } from "@chakra-ui/react";
import type { FC, PropsWithChildren } from "react";
import { useLayoutContext } from "../../layout";

const OpenSideMenuButton: FC<PropsWithChildren> = ({ children }) => {
  const { sidebar } = useLayoutContext();

  return (
    <Link as="button" color="blue.400" onClick={sidebar.onOpen}>
      {children}
    </Link>
  );
};

export default OpenSideMenuButton;

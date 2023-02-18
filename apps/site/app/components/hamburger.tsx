import { Button } from "@chakra-ui/react";
import eases from "eases";
import type { Variant } from "framer-motion";
import type { FC } from "react";
import type { SetStateType } from "../utils/types";
import type { MotionBoxProps } from "./motion-box";
import { MotionBox } from "./motion-box";
import { MotionFlex } from "./motion-flex";

enum HamburgerState {
  Open = "open",
  Closed = "closed",
}

const HamburgerBar: FC<MotionBoxProps & { variants: { [key in HamburgerState]?: Variant } }> = ({
  variants,
  ...rest
}) => {
  return (
    <MotionBox
      variants={variants}
      transition={{ type: "tween", duration: 0.4, ease: eases.expoOut }}
      initial={false}
      background="currentcolor"
      height="0.5"
      {...rest}
    />
  );
};

export interface HamburgerProps {
  open: boolean;
  setOpen: SetStateType<boolean>;
}

const Hamburger: FC<HamburgerProps> = ({ open, setOpen }) => {
  const distance = "5px";

  return (
    <Button variant="ghost" px="2" onClick={() => setOpen((o) => !o)}>
      <MotionFlex animate={open ? HamburgerState.Open : HamburgerState.Closed} flexDir="column" width="6">
        <HamburgerBar
          variants={{
            [HamburgerState.Open]: { transform: `rotate(45deg) translateX(${distance}) translateY(${distance})` },
          }}
        />
        <HamburgerBar
          variants={{
            [HamburgerState.Open]: { transform: "scaleX(0)" },
            [HamburgerState.Closed]: { transform: "scaleX(1)" },
          }}
          my={distance}
        />
        <HamburgerBar
          variants={{
            [HamburgerState.Open]: { transform: `rotate(-45deg) translateX(${distance}) translateY(-${distance})` },
          }}
        />
      </MotionFlex>
    </Button>
  );
};
export default Hamburger;

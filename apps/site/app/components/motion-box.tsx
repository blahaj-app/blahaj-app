import type { ChakraProps, ComponentWithAs } from "@chakra-ui/react";
import { Box, forwardRef } from "@chakra-ui/react";
import type { MotionProps } from "framer-motion";
import { isValidMotionProp, motion } from "framer-motion";
import * as React from "react";

export type MotionBoxProps = Omit<ChakraProps, keyof MotionProps> &
  MotionProps & {
    as?: React.ElementType;
  };

// @ts-expect-error "too complex"
export const MotionBox = motion(
  forwardRef<MotionBoxProps, "div">((props, ref) => {
    const chakraProps = Object.fromEntries(
      // do not pass framer props to DOM element
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    );
    return <Box ref={ref} {...chakraProps} />;
  }),
) as ComponentWithAs<"div", MotionBoxProps>;

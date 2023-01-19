import type { ChakraProps, ComponentWithAs } from "@chakra-ui/react";
import { Flex, forwardRef } from "@chakra-ui/react";
import type { MotionProps } from "framer-motion";
import { isValidMotionProp, motion } from "framer-motion";
import * as React from "react";

export type MotionFlexProps = Omit<ChakraProps, keyof MotionProps> &
  MotionProps & {
    as?: React.ElementType;
  };

// @ts-expect-error "too complex"
export const MotionFlex = motion(
  forwardRef<MotionFlexProps, "div">((props, ref) => {
    const chakraProps = Object.fromEntries(
      // do not pass framer props to DOM element
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    );
    return <Flex ref={ref} {...chakraProps} />;
  }),
) as ComponentWithAs<"div", MotionFlexProps>;

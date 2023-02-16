/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { ChakraProps, ComponentWithAs } from "@chakra-ui/react";
import { Flex, forwardRef } from "@chakra-ui/react";
import type { MotionProps } from "framer-motion";
import { isValidMotionProp, motion } from "framer-motion";

export type MotionFlexProps = Omit<ChakraProps, keyof MotionProps> &
  MotionProps & {
    as?: React.ElementType;
  };

// @ts-ignore type too complex
export const MotionFlex = motion(
  // @ts-ignore type too complex
  forwardRef<MotionFlexProps, "div">((props, ref) => {
    const chakraProps = Object.fromEntries(
      // do not pass framer props to DOM element
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    );

    // @ts-ignore type too complex

    return <Flex ref={ref} {...chakraProps} />;
  }),
) as ComponentWithAs<"div", MotionFlexProps>;

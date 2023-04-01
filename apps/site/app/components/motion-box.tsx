/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { ChakraProps, ComponentWithAs } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import type { MotionProps } from "framer-motion";
import { isValidMotionProp, motion } from "framer-motion";
import { forwardRef } from "react";

export type MotionBoxProps = Omit<ChakraProps, keyof MotionProps> &
  MotionProps & {
    as?: React.ElementType;
  };

// @ts-ignore type too complex
export const MotionBox = motion(
  // @ts-ignore type too complex
  forwardRef<MotionBoxProps, "div">(function MotionBox(props, ref) {
    const chakraProps = Object.fromEntries(
      // do not pass framer props to DOM element
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    );

    // @ts-ignore type too complex
    return <Box ref={ref} {...chakraProps} />;
  }),
) as ComponentWithAs<"div", MotionBoxProps>;

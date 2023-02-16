import { Box } from "@chakra-ui/react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { MotionBox } from "./motion-box";

const AnimateTextWrap: FC<{ text: string }> = ({ text }) => {
  const innerBoxRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const innerBox = innerBoxRef.current;
    if (!innerBox) return;

    setHeight(innerBox?.scrollHeight ?? 0);
  }, [text]);

  return (
    <MotionBox
      animate={{ height }}
      transition={{
        type: "tween",
        duration: 0.5,
      }}
      overflow="hidden"
    >
      <Box ref={innerBoxRef}>{text}</Box>
    </MotionBox>
  );
};

export default AnimateTextWrap;

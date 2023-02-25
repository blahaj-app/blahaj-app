declare module "*?dataurl" {
  const content: string;
  export default content;
}

declare module "*?binary" {
  const content: Uint8Array;
  export default content;
}

declare module "*?svgr" {
  import type React from "react";
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

import { useLayoutEffect, useEffect } from "react";

export const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

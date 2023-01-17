import { useEffect } from "react";
import { forwardRef, useMemo, useRef, useState, useCallback } from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "../lib/use-isomorphic-layout-effect";

type UseLineClampArgs = {
  maxHeight: number;
  value: string;
  expanded?: boolean;
};

type UseLineClampValues = {
  ref: React.RefObject<HTMLElement>;
  isClamped: boolean;
};

const useLineClamp = ({
  maxHeight,
  value,
  expanded = false,
}: UseLineClampArgs) => {
  const ref = useRef<HTMLDivElement>(null);

  const [clampedText, setClampedText] = useState(value);

  const measureHeight = useCallback(() => {
    if (expanded) {
      setClampedText(value);
      return;
    }

    const { current } = ref;
    if (!current) return;

    // Set the text content to the full value to check whether the value fits
    // inside the max height without any truncation.
    current.textContent = value;

    // if the full text fits inside the max height, we're done.
    if (current.clientHeight <= maxHeight) {
      console.log("no clamping!");
      setClampedText(value);
      return;
    }

    let substrings = value.split(" ");
    let left = 0;
    let right = substrings.length - 1;

    let i = 0;
    let clampIndex = null;

    while (true && i < 1_000_000_000) {
      const pivot = left + Math.floor((right - left) / 2);

      if (left === pivot) {
        break;
      }

      // Replace the text content with the substring we're measuring.
      current.textContent = substrings.slice(0, pivot).join(" ") + "…";
      // If it doesn't fit, pivot to a shorter substring.
      if (current.clientHeight > maxHeight) {
        right = pivot - 1;
      } else {
        clampIndex = pivot;
        // If it does fit, pivot to a longer substring.
        left = pivot;
      }
    }

    setClampedText(
      clampIndex ? substrings.slice(0, clampIndex).join(" ") + "…" : value
    );
  }, [expanded, maxHeight, value]);

  useEffect(() => {
    const handleResize = measureHeight;
    // TODO: throttle the resize handler...
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureHeight]);

  useLayoutEffect(() => {
    measureHeight();
  }, [measureHeight]);

  return useMemo(() => {
    const isClamped = clampedText !== value;
    return { ref, clampedText, isClamped };
  }, [clampedText, value]);
};

// TODO: allow all div props to be passed through.
const LineClamp = forwardRef<
  HTMLDivElement,
  { value: string; clampedText: string }
>(function LineClamp({ value, clampedText }, ref) {
  return (
    <div style={{ lineHeight: 1.5 }}>
      <div
        ref={ref}
        style={{
          lineHeight: 1.5,
          opacity: 0,
          pointerEvents: "none",
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
          visibility: "hidden",
          zIndex: -1,
        }}
      >
        {value}
      </div>

      {clampedText}
    </div>
  );
});

const testStr =
  `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia ab enim accusamus aliquam, quod ullam odio quas animi, perferendis eum voluptate aliquid hic tempore, assumenda iusto! Obcaecati, nostrum? Corrupti, nam?`.repeat(
    4
  );

export default function LineClampText() {
  const [expanded, setExpanded] = useState(false);
  const { ref, clampedText, isClamped } = useLineClamp({
    maxHeight: 16 * 1.5 * 4,
    value: testStr,
    expanded,
  });

  const [w, setW] = useState(12);
  return (
    <>
      <LineClamp ref={ref} clampedText={clampedText} value={testStr} />
      <button
        style={{
          backgroundColor: "white",
          border: "none",
          color: "black",
          padding: "0.25rem 0.5rem",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {isClamped ? "clamped" : "not clamped"}
      </button>
      <button onClick={() => setW((w) => (w === 100 ? 12 : 100))}>
        expand
      </button>
      <div
        style={{
          width: w,
          height: 20,
          border: "1px solid red",
          marginTop: "1rem",
          transition: "width 100ms ease-in-out",
        }}
      ></div>
    </>
  );
}

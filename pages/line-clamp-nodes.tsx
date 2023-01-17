import {
  forwardRef,
  Fragment,
  HTMLProps,
  ReactNode,
  Ref,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "../lib/use-isomorphic-layout-effect";

type UseClampArgs<T extends unknown> = {
  maxHeight: number;
  items: T[];
  renderItem?: (item: T) => ReactNode;
};

type ClampProps<T extends unknown> = {
  ref: Ref<HTMLElement>;
  items: T[];
  renderItem: (item: T) => ReactNode;
  visibleItems: T[];
};

type UseClampValues<T extends unknown> = {
  clampProps: ClampProps<T>;
  hiddenItems: T[];
  isClamped: boolean;
};

const useClamp = <T extends unknown>({
  maxHeight,
  items,
  // TODO: should this be required?
  renderItem = (x) => x as ReactNode,
}: UseClampArgs<T>): UseClampValues<T> => {
  const ref = useRef<HTMLElement>(null);

  // By default, we'll show all items
  const [splitIndex, setSplitIndex] = useState(items.length - 1);

  // !!! IDEA: we may be able to do a binary search / bisect the array to minimize
  //     the number of times we need to hit the DOM. We'll hold this in our back pocket
  //     for now and start with the simple approach (loop from back of array and remove
  //     nodes until it fits.).
  const evaluateSize = useCallback(() => {
    const { current } = ref;
    if (!current) return;
    const containerTop = current.getBoundingClientRect().top;
    const bottomLimit = containerTop + maxHeight;

    const nodes = current.childNodes;

    let cutIndex = null;
    for (const [i, node] of nodes.entries()) {
      const bottomEdge = (node as HTMLElement).getBoundingClientRect().bottom;

      if (bottomEdge > bottomLimit && i > 0) {
        cutIndex = i - 1;
        break;
      }
    }

    // If we didn't find a cut index, then we can show all items
    setSplitIndex(cutIndex ?? items.length - 1);
  }, [items.length, maxHeight]);

  useEffect(() => {
    const listener = evaluateSize;
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [evaluateSize]);

  useLayoutEffect(() => {
    evaluateSize();
  }, [evaluateSize]);

  return useMemo(() => {
    const visibleItems = items.slice(0, splitIndex + 1);
    const hiddenItems = items.slice(splitIndex + 1);
    const isClamped = hiddenItems.length > 0;

    const clampProps: ClampProps<T> = { ref, visibleItems, items, renderItem };
    return {
      clampProps,
      hiddenItems,
      isClamped,
    };
  }, [items, splitIndex, renderItem]);
};

const ForwardRefClampFunction = <T extends unknown = unknown>(
  {
    renderItem,
    items,
    visibleItems,
    ...rest
  }: Omit<ClampProps<T>, "ref"> & HTMLProps<HTMLDivElement>,
  ref: ClampProps<T>["ref"]
) => {
  return (
    <>
      <div {...rest}>
        <div
          ref={ref as Ref<HTMLDivElement>}
          aria-hidden
          {...rest}
          style={{
            ...(rest.style ?? {}),
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
          {items.map((x, i) => (
            <span data-clampmeasurement={i} key={i}>
              {renderItem(x)}
            </span>
          ))}
        </div>

        {visibleItems.map((x, i) => (
          <Fragment key={i}>{renderItem(x)}</Fragment>
        ))}
      </div>
    </>
  );
};

const Clamp = forwardRef<HTMLElement>(ForwardRefClampFunction as any) as <
  T extends unknown
>(
  props: ClampProps<T> & Omit<HTMLProps<HTMLDivElement>, "ref">
) => JSX.Element;

// -----------------------------------------------------------------------------
// USAGE
// -----------------------------------------------------------------------------

const genItems = (len: number) =>
  new Array(len)
    .fill(0)
    .map((_, i) => i + ": lorem ipsum dolor sit amet".repeat(i + 1));

/**
 * Goals:
 * - [ ] Performance optimizations: perf starts to choke somewhere around ~100 items,
 *       is enough to crash page @ 1000 items
 *        - It's just React inserting a large number of nodes into the DOM...probably not a problem.
 * - [ ] Smartly decide which nodes to delete based on their size (i.e. what if the first
 *       node is 100px tall, and the second node is 10px tall? We should delete the first)
 */
export default function LineClampPage() {
  const [height, setHeight] = useState(100);
  const [items, setItems] = useState(genItems(10));

  const { clampProps, hiddenItems, isClamped } = useClamp({
    maxHeight: height,
    items,
    renderItem: (x) => <div style={{ padding: "1rem" }}>{x}</div>,
  });

  return (
    <>
      <label>
        <span>height</span>
        <input
          type="number"
          value={height}
          style={{ marginBottom: 24 }}
          onChange={(ev) => setHeight(Number(ev.target.value))}
        />
      </label>

      <label>
        <span>no. items</span>
        <input
          type="number"
          defaultValue={items.length}
          onChange={(ev) => setItems(genItems(Number(ev.target.value)))}
        />
      </label>

      {isClamped && (
        <details
          style={{
            backgroundColor: "paleturquoise",
            color: "black",
            marginTop: "1rem",
          }}
        >
          <summary>+{hiddenItems.length} items hidden</summary>

          {/**
           * TODO: need a way to lazy-initialize the hidden items instead keeping them
           * around in the DOM. When there's a lot it can choke the browser!
           */}
          {/* <ul>
            {hiddenItems.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul> */}
        </details>
      )}

      <div style={{ position: "relative" }}>
        <Clamp
          {...clampProps}
          style={{ display: "flex", flexWrap: "wrap", maxWidth: 900 }}
        />

        <div
          style={{
            border: "1px solid red",
            height,
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        />
      </div>
    </>
  );
}

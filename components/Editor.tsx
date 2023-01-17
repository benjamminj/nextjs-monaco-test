import { Suspense } from "react";
import { EditorLoader } from "./EditorLoader";

export const Editor = () => {
  console.log("runs!!");
  return (
    <Suspense fallback="WUUUUUUUT">
      <EditorLoader />;
    </Suspense>
  );
};

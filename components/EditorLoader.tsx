import dynamic from "next/dynamic";
import { Suspense, useEffect, useReducer, useState } from "react";

const MonacoLoadingSkeleton = () => {
  return (
    <div style={{ height: "90vh", width: "100%", backgroundColor: "#222" }} />
  );
};

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <MonacoLoadingSkeleton />,
});

const loadMonaco = async () => {
  try {
    const [monaco, loader] = await Promise.all([
      // Importing from the editor module directly avoids creating a bundle per
      // language syntax supported by monaco. Since we know what languages we support
      // we can import them directly.
      import("monaco-editor/esm/vs/editor/editor.api"),
      import("@monaco-editor/react").then((x) => x.loader),
    ]);
    loader.config({ monaco });
  } catch (error) {}
};

export const EditorLoader = () => {
  const [loaded, setLoaded] = useReducer(() => true, false);
  useEffect(() => {
    loadMonaco().then(() => setLoaded());
  }, []);
  return loaded ? (
    <MonacoEditor
      height="90vh"
      theme="vs-dark"
      loading={<MonacoLoadingSkeleton />}
    />
  ) : (
    <MonacoLoadingSkeleton />
  );
};

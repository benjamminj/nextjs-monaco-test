// import { createContext, useContext, useRef, useState } from "react";
// import { createStore, StoreApi, useStore, StateCreator } from "zustand";

// const FormContext = createContext<StoreApi<any>>(
//   createStore(() => ({
//     count: 0,
//     input: "",
//     actions: { inc: () => {}, dec: () => {} },
//   }))
// );

// type Log = <T extends unknown, A>(
//   f: StateCreator<T, [], []>
// ) => StateCreator<T, [], []>;

// const log: Log = (config) => (set, get, api) => {
//   return config(
//     (...args) => {
//       console.log("action:", args);
//       set(...args);
//       console.log("new state:", get());
//     },
//     get,
//     api
//   );
// };

// const createFormStore = log((set) => ({
//   count: 0,
//   input: "",
//   actions: {
//     inc: () => set((state) => ({ count: state.count + 1 })),
//     dec: () => set((state) => ({ count: state.count - 1 })),
//     type: (v: string) => set({ input: v }),
//   },
// }));

// const Form = (props) => {
//   return (
//     <form>
//       <Provider>{props.children}</Provider>
//     </form>
//   );
// };

// const buttonStyles = {
//   fontSize: "2rem",
//   width: "3rem",
// };
// const Inc = () => {
//   const store = useContext(FormContext);
//   const inc = useStore(store, (store) => store.actions.inc);
//   return (
//     <button style={buttonStyles} onClick={inc} type="button">
//       +
//     </button>
//   );
// };

// const Dec = () => {
//   const store = useContext(FormContext);
//   const dec = useStore(store, (store) => store.actions.dec);
//   return (
//     <button style={buttonStyles} onClick={dec} type="button">
//       -
//     </button>
//   );
// };

// const Input = () => {
//   const store = useContext(FormContext);
//   const input = useStore(store, (store) => store.input);
//   const actions = useStore(store, (store) => store.actions);
//   return (
//     <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
//       <span>woohoo</span>
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => actions.type(e.target.value)}
//       />
//     </label>
//   );
// };

// const Value = () => {
//   const [name, setName] = useState("count");
//   const store = useContext(FormContext);
//   const slice = useStore(store, (store) => {
//     return store[name];
//   });
//   return (
//     <>
//       <button type="button" onClick={() => setName("count")}>
//         view count
//       </button>
//       <button type="button" onClick={() => setName("input")}>
//         view input
//       </button>
//       <div style={{ fontSize: "5rem" }}>{slice}</div>
//     </>
//   );
// };

// export default function About() {
//   return (
//     <div style={{ margin: "0 auto", width: "300px" }}>
//       <Form>
//         <Value />

//         <div style={{ display: "flex", gap: "1rem" }}>
//           <Inc />
//           <Dec />
//         </div>

//         <div style={{ marginTop: "3rem" }}>
//           <Input />
//         </div>
//       </Form>
//     </div>
//   );
// }

export default function About() {
  return null;
}

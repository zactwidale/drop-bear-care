// import { useEffect } from 'react';

// export function useKeyboardAvoidance() {
// useEffect(() => {
//   const handleFocus = (event: FocusEvent) => {
//     const target = event.target as HTMLElement;
//     if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
//       setTimeout(() => {
//         target.scrollIntoView({ behavior: "smooth", block: "center" });
//       }, 100);
//     }
//   };
//   document.addEventListener("focus", handleFocus, true);
//   return () => {
//     document.removeEventListener("focus", handleFocus, true);
//   };
// }, []);
// }

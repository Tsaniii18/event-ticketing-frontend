import { useEffect, useRef } from "react";

export default function useClickOutside(elementRef, onClickOutside) {
  const callbackRef = useRef(onClickOutside);

  useEffect(() => {
    callbackRef.current = onClickOutside;
  }, [onClickOutside]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (
        elementRef.current &&
        !elementRef.current.contains(event.target)
      ) {
        callbackRef.current();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [elementRef]);
}

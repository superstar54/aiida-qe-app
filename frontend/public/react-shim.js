
// Grab the UMD build that CRA loaded onto window.React
const React = window.React;

// Export React as the default, and re-export every named API,
// including version (so React6.version is defined).
export default React;

export const {
  // Basic APIs
  Children,
  Component,
  PureComponent,
  Fragment,
  createElement,
  createContext,
  cloneElement,
  createRef,
  forwardRef,
  lazy,
  memo,
  Profiler,
  StrictMode,
  Suspense,

  // All the built‐in hooks
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  useDeferredValue,
  useTransition,
  useId,
  useSyncExternalStore,

  version,
} = React;

// React 19 (@types/react 19) removed the global `JSX` namespace — code is
// expected to use `React.JSX` instead. This codebase uses the bare global
// `JSX.Element` convention in ~18 files. Rather than rewrite each call site (and
// add React imports to files that don't have one), re-expose the global
// namespace as a thin alias of React.JSX. Safe because it only forwards to the
// canonical React types; remove once usages migrate to `React.JSX`.
import type { JSX as ReactJSX } from 'react';

declare global {
  namespace JSX {
    type ElementType = ReactJSX.ElementType;
    type Element = ReactJSX.Element;
    type ElementClass = ReactJSX.ElementClass;
    type ElementAttributesProperty = ReactJSX.ElementAttributesProperty;
    type ElementChildrenAttribute = ReactJSX.ElementChildrenAttribute;
    type LibraryManagedAttributes<C, P> = ReactJSX.LibraryManagedAttributes<C, P>;
    type IntrinsicAttributes = ReactJSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = ReactJSX.IntrinsicClassAttributes<T>;
    type IntrinsicElements = ReactJSX.IntrinsicElements;
  }
}

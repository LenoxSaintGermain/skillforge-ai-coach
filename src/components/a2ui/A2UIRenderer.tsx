import React from "react";
import { a2uiCatalog } from "./Catalog";

export interface A2UINode {
  type: string;
  props?: Record<string, any>;
  children?: Array<A2UINode | string> | string;
}

export interface A2UIRendererProps {
  payload: A2UINode;
}

export function A2UIRenderer({ payload }: A2UIRendererProps) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const { type, props = {}, children } = payload;
  const Component = a2uiCatalog[type];

  if (!Component) {
    console.warn(`[A2UI] Component type "${type}" not found in catalog.`);
    // Fallback to rendering children if component is unknown, or a simple span
    return (
      <div className="text-red-500 border border-red-500 p-2 text-sm rounded">
        Unsupported UI Component: {type}
      </div>
    );
  }

  // Handle children recursively
  const renderChild = (child: A2UINode | string, index: number) => {
    if (typeof child === "string") {
      return <React.Fragment key={index}>{child}</React.Fragment>;
    }
    return <A2UIRenderer key={index} payload={child} />;
  };

  const renderedChildren = children
    ? Array.isArray(children)
      ? children.map(renderChild)
      : typeof children === "string"
      ? children
      : <A2UIRenderer payload={children as A2UINode} />
    : null;

  return <Component {...props}>{renderedChildren}</Component>;
}

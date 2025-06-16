/// <reference types="vite/client" />
/// <reference types="@mdx-js/react" />

declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
  export const title: string;
  export const date: string;
  export const excerpt: string;
  export const thumbnail: string;
}

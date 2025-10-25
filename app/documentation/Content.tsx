"use client";
import ReactMarkdown from "react-markdown";
import GithubSlugger from 'github-slugger';

export default function Content({stringified}: {stringified: string}) {

  const slugger = new GithubSlugger(); 

  return (
    <ReactMarkdown
      components={{
        code(props) {
          const { children, node, ...rest } = props;
          if (children && typeof children === "string" && !(children.match("\n"))) {
            return (
              <code 
                style={{
                  padding: "4px",
                  backgroundColor: "#EEE"
                }}
                {...rest}
              >
                {children}
              </code>
            )
          } else return (
            <code 
              style={{
                backgroundColor: "#EEE"
              }}
              {...rest}
            >
              {children}
            </code>
          )

        },
        pre(props) {
          const { children, node, ...rest } = props;
          if (node) {
            const nodeChildren = Array.from(node.children);
            if (nodeChildren.some(nc => nc.type==="element" && nc.tagName === "code")) {
              return (
                <pre
                  style={{
                    padding: "6px",
                    backgroundColor: "#EEE"
                  }}
                  {...rest}
                >
                  {children}
                </pre>
              )
            } else return (
              <pre {...rest}>
                {children}
              </pre>
            )
          }
        },
        h1(props) {
          const {children, node, ...rest} = props;
          if (children && typeof children === "string") {
            return (
              <h1 id={slugger.slug(children)} {...rest}>
                {children}
              </h1>
            )
          } else {
            return (
              <h1 {...rest}>
                {children}
              </h1>
            )
          }
        },
        h2(props) {
          const {children, node, ...rest} = props;
          if (children && typeof children === "string") {
            return (
              <h2 id={slugger.slug(children)} {...rest}>
                {children}
              </h2>
            )
          } else {
            return (
              <h2 {...rest}>
                {children}
              </h2>
            )
          }
        },
        h3(props) {
          const {children, node, ...rest} = props;
          if (children && typeof children === "string") {
            return (
              <h3 id={slugger.slug(children)} {...rest}>
                {children}
              </h3>
            )
          } else {
            return (
              <h3 {...rest}>
                {children}
              </h3>
            )
          }
        },
        h4(props) {
          const {children, node, ...rest} = props;
          if (children && typeof children === "string") {
            return (
              <h4 id={slugger.slug(children)} {...rest}>
                {children}
              </h4>
            )
          } else {
            return (
              <h4 {...rest}>
                {children}
              </h4>
            )
          }
        }
      }}
    >
      {stringified}
    </ReactMarkdown>
  )
}
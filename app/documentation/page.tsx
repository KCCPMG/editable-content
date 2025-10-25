import NextPageLink from "@/components/LayoutComponents/NextPageLink";
import Contents from "./Contents";
import path from "path";
import fs from "fs";
import Content from "./Content";


export default async function Page() {

  const file_path = path.join(process.cwd(), "packages/editable-content/readme.md")
  const content = fs.readFileSync(file_path);
  const stringified = content.toString();

  return (
    <>
      <h1>README</h1>
      <h3>Contents</h3>
      <Contents />
      <Content stringified={stringified} />
      <NextPageLink href="/" text="Back to Main Demo" />
    </>
  )
}
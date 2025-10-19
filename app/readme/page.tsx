import NextPageLink from "@/components/LayoutComponents/NextPageLink";
import Contents from "./Contents";
import ReadmeContent from "./ReadmeContent";


export default function Page() {
  return (
    <>
      <h1>README</h1>
      <h3>Contents</h3>
      <Contents />
      <ReadmeContent />
      <NextPageLink href="/" text="Back to Main Demo" />
    </>
  )
}
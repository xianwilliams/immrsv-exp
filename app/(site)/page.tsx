import Experience from "@/components/experience";
import { getSiteContent } from "@/lib/cms/server";
export default async function Home() {
  const content = await getSiteContent();
  return <Experience content={content} />;
}

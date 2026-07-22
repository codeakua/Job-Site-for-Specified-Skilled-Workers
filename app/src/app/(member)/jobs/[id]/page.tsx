import { JobDetail } from "@/components/job-detail/JobDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <JobDetail id={id} />;
}

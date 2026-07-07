import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import WorkspaceHub from "@/components/workspace/WorkspaceHub";

export const metadata: Metadata = pageMeta({
  title: "Workspace",
  description: "Collaborate with your team: shared projects, members, roles and activity.",
  path: "/workspace",
  noindex: true,
});

export default function WorkspacePage() {
  return <WorkspaceHub />;
}

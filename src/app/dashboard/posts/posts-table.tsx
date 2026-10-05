"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { FileStack } from "lucide-react";
import { truncate, formatDate, formatDateTime } from "@/lib/utils";
import type { PlatformIdDb } from "@/types/database";

export interface PostRow {
  id: string;
  platform: PlatformIdDb;
  content: string;
  status: string;
  createdAt: string;
  accountName: string | null;
  workflowName: string | null;
  scheduledFor: string | null;
}

const tabs = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

const statusVariant: Record<string, "outline" | "warning" | "default" | "accent" | "success" | "destructive"> = {
  draft: "outline",
  pending_approval: "warning",
  approved: "default",
  scheduled: "accent",
  published: "success",
  failed: "destructive",
};

export function PostsTable({ posts }: { posts: PostRow[] }) {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const filtered = tab.value === "all" ? posts : posts.filter((p) => p.status === tab.value);
        return (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {filtered.length === 0 ? (
              <EmptyState icon={FileStack} title="Nothing here yet" className="border-0" />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Platform</th>
                      <th className="px-4 py-2.5 font-medium">Content</th>
                      <th className="px-4 py-2.5 font-medium">Account</th>
                      <th className="px-4 py-2.5 font-medium">Workflow</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((post) => (
                      <tr key={post.id}>
                        <td className="px-4 py-3">
                          <PlatformIcon platform={post.platform} className="size-4 text-muted-foreground" />
                        </td>
                        <td className="max-w-xs px-4 py-3 text-foreground">{truncate(post.content, 60)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{post.accountName ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{post.workflowName ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[post.status] ?? "outline"}>
                            {post.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {post.scheduledFor
                            ? `Scheduled ${formatDateTime(post.scheduledFor)}`
                            : formatDate(post.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

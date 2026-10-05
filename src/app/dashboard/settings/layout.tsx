import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your account, content defaults, and integrations." />
      <div className="flex flex-col gap-8 md:flex-row">
        <SettingsNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

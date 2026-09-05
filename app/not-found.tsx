import Link from "next/link";
import { GlassButton } from "@/components/glass/GlassButton";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Not found</h1>
      <p className="text-ink-muted">That page or template doesn&rsquo;t exist.</p>
      <Link href="/motion">
        <GlassButton variant="glass">Back to templates</GlassButton>
      </Link>
    </div>
  );
}

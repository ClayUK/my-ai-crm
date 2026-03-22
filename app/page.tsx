import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import JobBulkDeleteSelect from "./components/JobBulkDeleteSelect";

async function deleteSelectedJobs(formData: FormData) {
  "use server";

  const jobIds = formData
    .getAll("jobIds")
    .map((v) => String(v))
    .filter(Boolean);

  if (jobIds.length === 0) return;

  const ads = await prisma.ad.findMany({
    where: { jobId: { in: jobIds } },
    select: { id: true },
  });

  const adIds = ads.map((a) => a.id);

  // Delete children first to avoid FK constraint issues.
  if (adIds.length > 0) {
    await prisma.image.deleteMany({
      where: { adId: { in: adIds } },
    });
  }

  await prisma.referenceAsset.deleteMany({
    where: { jobId: { in: jobIds } },
  });

  await prisma.ad.deleteMany({
    where: { jobId: { in: jobIds } },
  });

  await prisma.job.deleteMany({
    where: { id: { in: jobIds } },
  });

  // Keep the UI simple after delete.
  redirect("/");
}

export default async function HomePage() {
  const jobs = await prisma.job.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
          Campaigns
        </h1>
        <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
          Fundraiser URL → evaluate → prompts → Kie images.
        </div>

        <div style={{ marginTop: 14 }}>
          <Link
            href="/new"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(124, 58, 237, 0.35)",
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Create Campaign
          </Link>
        </div>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 16,
          background: "var(--surface)",
        }}
      >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 900 }}>Recent Campaigns</div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75, color: "var(--textMuted)" }}>
              Delete old campaigns when you are done.
            </div>
          </div>
          {jobs.length > 0 ? (
            <div style={{ fontSize: 12, opacity: 0.65, color: "var(--textMuted)" }}>{jobs.length} total</div>
          ) : null}
        </div>

        <div style={{ marginTop: 14 }}>
          {jobs.length === 0 ? (
            <div style={{ opacity: 0.8, fontSize: 13, color: "var(--textMuted)" }}>
              No campaigns yet. Create your first one to generate ad tabs.
            </div>
          ) : (
            <form action={deleteSelectedJobs}>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10, color: "var(--textMuted)" }}>
                Tip: improve output quality by adding/updating memory in the Memory page.
              </div>

              <JobBulkDeleteSelect
                jobs={jobs.map((j) => ({
                  id: j.id,
                  url: j.url,
                  status: j.status,
                }))}
              />

              <div style={{ marginTop: 12 }}>
                <button
                  type="submit"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(239, 68, 68, 0.45)",
                    background: "rgba(239, 68, 68, 0.14)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Delete Selected
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

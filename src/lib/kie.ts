/** Override in production if Kie provides region-specific or proxy endpoints. */
function kieApiBase() {
    return (
        process.env.KIE_API_BASE?.trim() || "https://api.kie.ai"
    ).replace(/\/$/, "");
}

function kieUploadBase() {
    return (
        process.env.KIE_UPLOAD_BASE?.trim() ||
        "https://kieai.redpandaai.co"
    ).replace(/\/$/, "");
}

function getKieApiKey() {
    const key = process.env.KIE_API_KEY?.trim();
    if (!key) {
        throw new Error(
            "KIE_API_KEY is not set. Add it to environment variables (e.g. Railway)."
        );
    }
    return key;
}

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadReferenceFilesToKie(files: File[]) {
    const apiKey = getKieApiKey();
    const uploaded: Array<{
        filePath: string;
        originalName: string;
        mimeType: string | null;
    }> = [];

    for (const file of files) {
        const anyFile = file as any;
        // Avoid fragile `instanceof File` checks; in server runtimes the
        // File/Blob implementation can differ while still being usable.
        if (!anyFile || typeof anyFile.size !== "number" || anyFile.size === 0)
            continue;
        const fileName = anyFile.name || "reference-image";
        const fileType = anyFile.type || null;

        const form = new FormData();
        form.set("file", anyFile, fileName);
        form.set("uploadPath", "images/user-uploads");
        form.set("fileName", fileName);

        const res = await fetch(`${kieUploadBase()}/api/file-stream-upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: form,
        });

        const json = await res.json();

        if (!res.ok || json?.code !== 200 || !json?.data?.downloadUrl) {
            throw new Error(`Kie file upload failed: ${JSON.stringify(json)}`);
        }

        uploaded.push({
            filePath: json.data.downloadUrl,
            originalName: json.data.originalName || fileName,
            mimeType: json.data.mimeType || fileType,
        });
    }

    return uploaded;
}

export async function generateImageWithKie(
    prompt: string,
    referenceImages: string[] = [],
    aspectRatio: "1:1" | "9:16" = "1:1"
) {
    const apiKey = getKieApiKey();

    const createRes = await fetch(`${kieApiBase()}/api/v1/jobs/createTask`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "nano-banana-2",
            input: {
                prompt,
                image_input: referenceImages,
                google_search: true,
                aspect_ratio: aspectRatio,
                resolution: "1K",
                output_format: "png",
            },
        }),
    });

    const createJson = await createRes.json();

    if (!createRes.ok || createJson?.code !== 200 || !createJson?.data?.taskId) {
        throw new Error(
            `Kie task creation failed: ${JSON.stringify(createJson)}`
        );
    }

    const taskId = createJson.data.taskId;

    for (let attempt = 0; attempt < 30; attempt++) {
        await sleep(3000);

        const statusRes = await fetch(
            `${kieApiBase()}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        const statusJson = await statusRes.json();

        if (!statusRes.ok || statusJson?.code !== 200) {
            throw new Error(
                `Kie status check failed: ${JSON.stringify(statusJson)}`
            );
        }

        const data = statusJson.data;
        const state = data?.state;

        if (state === "success") {
            let parsedResult: unknown = data?.resultJson;

            if (typeof parsedResult === "string") {
                try {
                    parsedResult = JSON.parse(parsedResult);
                } catch { }
            }

            return {
                taskId,
                state,
                raw: statusJson,
                result: parsedResult,
            };
        }

        if (state === "fail") {
            throw new Error(
                `Kie generation failed: ${data?.failMsg || "Unknown failure"}`
            );
        }
    }

    throw new Error("Kie generation timed out.");
}
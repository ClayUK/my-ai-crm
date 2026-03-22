module.exports = [
"[project]/src/lib/prisma.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/app/new/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "default",
    ()=>NewJobPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"40730f95c785369b4ed2e31e5d2ca0bfdd6084b025":"$$RSC_SERVER_ACTION_0"},"",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
;
function normalizeAdCount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "6";
    if (parsed < 1) return "1";
    if (parsed > 1000) return "1000";
    return String(Math.floor(parsed));
}
function inferTestimonialUsage(campaignType, primaryAngles) {
    const s = (primaryAngles || "").toLowerCase();
    const hasTrustForProduct = s.includes("social proof") || s.includes("founder story") || s.includes("reviews") || s.includes("transparency") || s.includes("science-backed") || s.includes("science backed");
    const hasTrustForDonation = s.includes("x,000") || s.includes("people already gave") || s.includes("transparency") || s.includes("where money goes") || s.includes("real results") || s.includes("endorsed") || s.includes("trusted") || s.includes("founder/insider") || s.includes("founder/insider story");
    if (campaignType === "donation") return hasTrustForDonation ? "Yes" : "Mix";
    return hasTrustForProduct ? "Yes" : "Mix";
}
const $$RSC_SERVER_ACTION_0 = async function createCampaign(formData) {
    const url = String(formData.get("url") || "").trim();
    if (!url) throw new Error("URL is required");
    const normalizedUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const campaignType = String(formData.get("campaignType") || "product").trim() || "product";
    const selectedPrimaryAngles = campaignType === "product" ? formData.getAll("primaryAnglesSelected").map((v)=>String(v).trim()).filter(Boolean) : [];
    const selectedPrimaryAnglesUnique = Array.from(new Set(selectedPrimaryAngles));
    const selectedDonationAngles = campaignType === "donation" ? Array.from(new Set([
        ...formData.getAll("donationAnglesSelected").map((v)=>String(v).trim()),
        ...formData.getAll("donationAnglesSelected[]").map((v)=>String(v).trim())
    ])).filter(Boolean) : [];
    const platform = String(formData.get("platform") || "Meta").trim() || "Meta";
    const funnelStage = String(formData.get("funnelStage") || "Mix").trim() || "Mix";
    // Kept as a default because generation still expects a formatRatio string.
    // We no longer expose this in the UI; aspect ratio is chosen per-ad at image generation time.
    const formatRatio = "70% 9:16 / 30% 1080x1080";
    const primaryAnglesText = String(formData.get("primaryAngles") || "").trim();
    const primaryAngles = campaignType === "product" ? selectedPrimaryAnglesUnique.length ? `${selectedPrimaryAnglesUnique.join(", ")}${primaryAnglesText ? `, ${primaryAnglesText}` : ""}` : primaryAnglesText : campaignType === "donation" ? selectedDonationAngles.length ? `${selectedDonationAngles.join(", ")}${primaryAnglesText ? `, ${primaryAnglesText}` : ""}` : primaryAnglesText : primaryAnglesText;
    const testimonialUsage = inferTestimonialUsage(campaignType, primaryAngles);
    const ctaStyle = String(formData.get("ctaStyle") || "").trim() || "Mix";
    const visualStyle = String(formData.get("visualStyle") || "").trim() || "Mix";
    const numberOfAds = normalizeAdCount(formData.get("numberOfAds")?.toString().trim());
    const referenceImageTypesRaw = String(formData.get("referenceImageTypes") || "").trim();
    const referenceImageTypes = referenceImageTypesRaw || (campaignType === "donation" ? "Character" : "Product only");
    const creativeModeSelected = String(formData.get("creativeMode") || "Mix").trim() || "Mix";
    const adMixStrategy = String(formData.get("adMixStrategy") || "Even Mix").trim() || "Even Mix";
    const strictlyFollowSelectedAngles = formData.get("strictlyFollowSelectedAngles") ? true : false;
    const includeExperimentalAds = formData.get("includeExperimentalAds") ? true : false;
    const noAnglesSelected = campaignType === "product" ? selectedPrimaryAnglesUnique.length === 0 : campaignType === "donation" ? selectedDonationAngles.length === 0 : true;
    const shouldAutoExplore = noAnglesSelected && !primaryAnglesText && ctaStyle === "Mix" && visualStyle === "Mix";
    const effectiveCreativeMode = shouldAutoExplore && creativeModeSelected === "Mix" ? "Explore" : creativeModeSelected;
    // Back-compat: if the UI still submitted product-style values for a
    // donation campaign, map them to the closest donation-friendly bucket.
    const normalizedReferenceImageTypes = campaignType === "donation" && [
        "Product only",
        "Lifestyle",
        "Mix"
    ].includes(referenceImageTypes) ? "Character" : referenceImageTypes;
    const job = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].job.create({
        data: {
            url: normalizedUrl,
            campaignType,
            rawText: null,
            claudeOutput: null,
            status: "pending",
            kieResult: null,
            platform,
            funnelStage,
            formatRatio,
            primaryAngles,
            testimonialUsage,
            ctaStyle,
            visualStyle,
            numberOfAds,
            referenceImageTypes: normalizedReferenceImageTypes,
            creativeMode: effectiveCreativeMode,
            adMixStrategy,
            strictlyFollowSelectedAngles,
            includeExperimentalAds
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/jobs/${job.id}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "40730f95c785369b4ed2e31e5d2ca0bfdd6084b025", null);
var createCampaign = $$RSC_SERVER_ACTION_0;
function NewJobPage() {
    const campaignTypeValue = "product";
    const platformValue = "Meta";
    const funnelStageValue = "Mix";
    const primaryAnglesValue = "";
    const creativeModeValue = "Mix";
    const adMixStrategyValue = "Even Mix";
    const ctaStyleValue = "Mix";
    const visualStyleValue = "Mix";
    const numberOfAdsValue = "6";
    const referenceImageTypesValue = "Product only";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 18
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            margin: 0,
                            fontSize: 26,
                            fontWeight: 900
                        },
                        children: "Create Campaign"
                    }, void 0, false, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 190,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 6,
                            opacity: 0.75,
                            fontSize: 13
                        },
                        children: "Paste a product page or fundraiser URL, choose how you want SacredStatics to generate concepts, then build your ad set."
                    }, void 0, false, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 193,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/new/page.tsx",
                lineNumber: 189,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) 340px",
                    gap: 24,
                    alignItems: "start"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            action: createCampaign,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                                    // Toggle the PRODUCT-only checkbox group when campaign type changes.
                                    dangerouslySetInnerHTML: {
                                        __html: `
                        (function () {
                          function setReferenceOptions(group) {
                            const referenceSelect = document.getElementById('referenceImageTypes');
                            if (!referenceSelect) return;

                            const options = Array.from(referenceSelect.querySelectorAll('option'));
                            let firstEnabledValue = null;

                            for (const opt of options) {
                              const optGroup = opt.getAttribute('data-group');
                              const enabled = optGroup === group;
                              opt.disabled = !enabled;
                              if (enabled && !firstEnabledValue) firstEnabledValue = opt.value;
                            }

                            const selected = referenceSelect.selectedOptions && referenceSelect.selectedOptions[0];
                            const selectedEnabled = selected ? !selected.disabled : false;
                            if (!selectedEnabled && firstEnabledValue) {
                              referenceSelect.value = firstEnabledValue;
                            }
                          }

                          function sync() {
                            const select = document.getElementById('campaignType');
                            const wrap = document.getElementById('primaryAnglesSelectedWrap');
                            const donationWrap = document.getElementById('donationAnglesSelectedWrap');
                            const inputs = Array.from(document.querySelectorAll('input[name="primaryAnglesSelected"]'));
                            const donationInputs = Array.from(document.querySelectorAll('input[name="donationAnglesSelected[]"]'));

                            const isProduct = select && select.value === 'product';
                            const isDonation = select && select.value === 'donation';

                            if (wrap) wrap.style.display = isProduct ? 'block' : 'none';
                            if (donationWrap) donationWrap.style.display = isDonation ? 'block' : 'none';
                            for (const input of inputs) input.disabled = !isProduct;
                            for (const input of donationInputs) input.disabled = !isDonation;

                            setReferenceOptions(isDonation ? 'donation' : 'product');

                            // Update compact sidebar summary (best-effort).
                            const sidebarType = document.getElementById('sidebarCampaignType');
                            if (sidebarType && select) {
                              sidebarType.textContent = isDonation ? 'Donation' : 'Product';
                            }
                            const sidebarCreativeMode = document.getElementById('sidebarCreativeMode');
                            const creativeModeSelect = document.getElementById('creativeMode');
                            if (sidebarCreativeMode && creativeModeSelect) {
                              sidebarCreativeMode.textContent = creativeModeSelect.value || '';
                            }
                            const sidebarAdMixStrategy = document.getElementById('sidebarAdMixStrategy');
                            const adMixStrategySelect = document.getElementById('adMixStrategy');
                            if (sidebarAdMixStrategy && adMixStrategySelect) {
                              sidebarAdMixStrategy.textContent = adMixStrategySelect.value || '';
                            }
                            const sidebarPlatform = document.getElementById('sidebarPlatform');
                            const platformSelect = document.getElementById('platform');
                            if (sidebarPlatform && platformSelect) {
                              sidebarPlatform.textContent = platformSelect.value || '';
                            }
                            const sidebarNumberOfAds = document.getElementById('sidebarNumberOfAds');
                            const numberOfAdsInput = document.getElementById('numberOfAds');
                            if (sidebarNumberOfAds && numberOfAdsInput) {
                              sidebarNumberOfAds.textContent = numberOfAdsInput.value || '';
                            }

                            refreshAngleUiCounters();
                          }

                          function refreshAngleUiCounters() {
                            const totalEl = document.getElementById('totalAnglesSelectedCounter');
                            const sidebarTotalEl = document.getElementById('sidebarTotalAnglesSelectedCounter');
                            const memberBoxes = Array.from(
                              document.querySelectorAll(
                                'input[type="checkbox"][name="primaryAnglesSelected"], input[type="checkbox"][name="donationAnglesSelected[]"]'
                              )
                            );
                            const totalSelected = memberBoxes.filter(
                              (b) => b.checked && !b.disabled
                            ).length;

                            if (totalEl) totalEl.textContent = String(totalSelected);
                            if (sidebarTotalEl) sidebarTotalEl.textContent = String(totalSelected);

                            const groupEls = Array.from(
                              document.querySelectorAll('[data-angle-group]')
                            );

                            for (const groupEl of groupEls) {
                              const groupKey = groupEl.getAttribute('data-angle-group');
                              if (!groupKey) continue;

                              const groupMembers = Array.from(
                                groupEl.querySelectorAll(
                                  'input[type="checkbox"][name="primaryAnglesSelected"], input[type="checkbox"][name="donationAnglesSelected[]"]'
                                )
                              );

                              const selectedCount = groupMembers.filter(
                                (b) => b.checked && !b.disabled
                              ).length;

                              const summarySpan = document.querySelector(
                                '[data-angle-summary="' + groupKey + '"]'
                              );
                              if (summarySpan) summarySpan.textContent = String(selectedCount);
                            }
                          }

                          function wireAngleSelectAll() {
                            const selectAllBoxes = Array.from(document.querySelectorAll('input[data-select-all-for]'));

                            for (const selectAllBox of selectAllBoxes) {
                              const groupKey = selectAllBox.getAttribute('data-select-all-for');
                              const selector =
                                '[data-angle-group="' + groupKey + '"]';
                              const groupEl = document.querySelector(selector);
                              if (!groupEl) continue;

                              const memberBoxes = Array.from(
                                groupEl.querySelectorAll(
                                  'input[type="checkbox"][name="primaryAnglesSelected"], input[type="checkbox"][name="donationAnglesSelected[]"]'
                                )
                              );
                              if (memberBoxes.length === 0) continue;

                              const updateFromMembers = () => {
                                const checkedCount = memberBoxes.filter((b) => b.checked).length;
                                const total = memberBoxes.length;

                                selectAllBox.indeterminate =
                                  checkedCount > 0 && checkedCount < total;
                                selectAllBox.checked = checkedCount === total && total > 0;

                                refreshAngleUiCounters();
                              };

                              // Toggle all members when select-all is clicked.
                              selectAllBox.addEventListener('click', () => {
                                const nextChecked = selectAllBox.checked;
                                for (const member of memberBoxes) {
                                  member.checked = nextChecked;
                                }
                                // Ensure derived UI state is updated after browser applies the click.
                                setTimeout(updateFromMembers, 0);
                              });

                              // Keep select-all in sync when individual members are clicked.
                              for (const member of memberBoxes) {
                                member.addEventListener('click', updateFromMembers);
                              }

                              updateFromMembers();
                            }
                          }

                          let didInit = false;

                          function initOnce() {
                            // On Next.js client-side navigation, the "load" event can
                            // already be past. Retry until the key elements exist.
                            const select = document.getElementById(
                              'campaignType'
                            );
                            if (!select) {
                              setTimeout(initOnce, 50);
                              return;
                            }
                            if (didInit) return;
                            didInit = true;
                            init();
                          }

                          function init() {
                            const select = document.getElementById('campaignType');
                            if (select) {
                              select.addEventListener('change', sync);
                              select.addEventListener('input', sync);
                            }
                            const creativeModeSelect = document.getElementById('creativeMode');
                            if (creativeModeSelect) {
                              creativeModeSelect.addEventListener('change', sync);
                            }
                            const adMixStrategySelect = document.getElementById('adMixStrategy');
                            if (adMixStrategySelect) {
                              adMixStrategySelect.addEventListener('change', sync);
                            }
                            const platformSelect = document.getElementById('platform');
                            if (platformSelect) {
                              platformSelect.addEventListener('change', sync);
                            }
                            const numberOfAdsInput = document.getElementById('numberOfAds');
                            if (numberOfAdsInput) {
                              numberOfAdsInput.addEventListener('input', sync);
                            }
                            sync();
                            wireAngleSelectAll();

                            const expandBtn = document.getElementById('expandAllPrimaryAnglesBtn');
                            const collapseBtn = document.getElementById('collapseAllPrimaryAnglesBtn');

                            function setAll(open) {
                              const sections = Array.from(
                                document.querySelectorAll('details[data-angle-category]')
                              );
                              for (const sec of sections) sec.open = open;
                            }

                            if (expandBtn) {
                              expandBtn.addEventListener('click', () => setAll(true));
                            }
                            if (collapseBtn) {
                              collapseBtn.addEventListener('click', () => setAll(false));
                            }

                            refreshAngleUiCounters();
                          }

                          // Prefer initOnce for both full page load and client-side navigation.
                          setTimeout(initOnce, 0);
                          window.addEventListener('load', initOnce);
                        })();
                      `
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/new/page.tsx",
                                    lineNumber: 209,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        padding: 18,
                                        background: "var(--surface)",
                                        boxShadow: "0 1px 10px rgba(0, 0, 0, 0.15)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "campaignType",
                                                    children: "Campaign Type"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 448,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 449,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "campaignType",
                                                    name: "campaignType",
                                                    defaultValue: campaignTypeValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "product",
                                                            children: "Product / Ecommerce"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 456,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "donation",
                                                            children: "Donation / Fundraiser"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 457,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 447,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "url",
                                                    children: "Website URL"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 463,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "url",
                                                    name: "url",
                                                    type: "url",
                                                    placeholder: "https://example.com/product-page",
                                                    required: true,
                                                    style: {
                                                        width: 500,
                                                        padding: 8,
                                                        marginTop: 8
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 464,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 461,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "platform",
                                                    children: "Platform"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 475,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 476,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "platform",
                                                    name: "platform",
                                                    defaultValue: platformValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Meta"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 483,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "TikTok"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 484,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Pinterest"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 485,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Google Display"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 486,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Mix"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 487,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 477,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 474,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "funnelStage",
                                                    children: "Funnel Stage"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 492,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "funnelStage",
                                                    name: "funnelStage",
                                                    defaultValue: funnelStageValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Cold"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 500,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Warm"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 501,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Mix"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 502,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 494,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 491,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "primaryAngles",
                                                    children: "Primary Angles Notes (optional)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 512,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "primaryAngles",
                                                    name: "primaryAngles",
                                                    defaultValue: primaryAnglesValue,
                                                    style: {
                                                        width: 500,
                                                        padding: 8,
                                                        marginTop: 8
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 516,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 511,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "creativeMode",
                                                    children: "Creative Mode"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 525,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 526,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "creativeMode",
                                                    name: "creativeMode",
                                                    defaultValue: creativeModeValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Explore",
                                                            children: "Explore"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 533,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Scale Winners",
                                                            children: "Scale Winners"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 534,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Mix",
                                                            children: "Mix"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 535,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 527,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 524,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "adMixStrategy",
                                                    children: "Ad Mix Strategy"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 540,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 541,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "adMixStrategy",
                                                    name: "adMixStrategy",
                                                    defaultValue: adMixStrategyValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Even Mix",
                                                            children: "Even Mix"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 548,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Heavy Testing",
                                                            children: "Heavy Testing"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 549,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Focused Batch",
                                                            children: "Focused Batch"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 550,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 542,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginTop: 8,
                                                        fontSize: 12,
                                                        opacity: 0.85,
                                                        lineHeight: 1.35
                                                    },
                                                    children: "Even Mix = balanced variety. Heavy Testing = wider experimentation. Focused Batch = tighter variations."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 552,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginTop: 6,
                                                        fontSize: 12,
                                                        opacity: 0.85,
                                                        lineHeight: 1.35
                                                    },
                                                    children: "If you leave angles/styles on Mix, the system will generate a broad randomized testing batch."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 563,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 539,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 14,
                                                display: "flex",
                                                gap: 14,
                                                flexWrap: "wrap"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: "flex",
                                                        gap: 8,
                                                        alignItems: "center",
                                                        fontSize: 13
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            id: "strictlyFollowSelectedAngles",
                                                            name: "strictlyFollowSelectedAngles",
                                                            defaultChecked: false
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 585,
                                                            columnNumber: 25
                                                        }, this),
                                                        "Strictly Follow Selected Angles"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 577,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: "flex",
                                                        gap: 8,
                                                        alignItems: "center",
                                                        fontSize: 13
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            id: "includeExperimentalAds",
                                                            name: "includeExperimentalAds",
                                                            defaultChecked: false
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 601,
                                                            columnNumber: 25
                                                        }, this),
                                                        "Include Experimental / Clickbait Ads"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 593,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 576,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                            id: "primaryAnglesAccordion",
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                    style: {
                                                        cursor: "pointer",
                                                        fontWeight: 900,
                                                        color: "var(--foreground)",
                                                        marginBottom: 8
                                                    },
                                                    children: [
                                                        "Primary Angles • Total angles selected:",
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            id: "totalAnglesSelectedCounter",
                                                            children: "0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 624,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 615,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                gap: 10,
                                                                marginBottom: 14,
                                                                flexWrap: "wrap"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    id: "expandAllPrimaryAnglesBtn",
                                                                    style: {
                                                                        padding: "8px 12px",
                                                                        borderRadius: 10,
                                                                        border: "1px solid var(--border)",
                                                                        background: "var(--surfaceElevated)",
                                                                        cursor: "pointer",
                                                                        color: "var(--foreground)"
                                                                    },
                                                                    children: "Expand all"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 636,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    id: "collapseAllPrimaryAnglesBtn",
                                                                    style: {
                                                                        padding: "8px 12px",
                                                                        borderRadius: 10,
                                                                        border: "1px solid var(--border)",
                                                                        background: "var(--surface)",
                                                                        cursor: "pointer",
                                                                        color: "var(--foreground)"
                                                                    },
                                                                    children: "Collapse all"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 650,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 628,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            id: "primaryAnglesSelectedWrap",
                                                            style: {
                                                                marginTop: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-problem-focused",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Problem-Focused (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-problem-focused",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 680,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 672,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 10
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Problem-Focused"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 685,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-problem-focused"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 690,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 689,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 688,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-problem-focused",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Problem/Solution",
                                                                                        "Before/After",
                                                                                        "Root Cause Reveal",
                                                                                        "Common Mistake",
                                                                                        "Worst Case Scenario"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 706,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 705,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 694,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 684,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 671,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-desire-aspiration",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Desire & Aspiration (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-desire-aspiration",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 727,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 719,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Desire & Aspiration"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 732,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-desire-aspiration"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 737,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 736,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 735,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-desire-aspiration",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Lifestyle Aspiration",
                                                                                        "Dream Outcome",
                                                                                        "Identity Shift",
                                                                                        "Future Self",
                                                                                        "Transformation"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 753,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 752,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 741,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 731,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 718,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-trust-credibility",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Trust & Credibility (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-trust-credibility",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 774,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 766,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Trust & Credibility"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 779,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-trust-credibility"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 784,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 783,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 782,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-trust-credibility",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Social Proof",
                                                                                        "Science-Backed",
                                                                                        "Founder Story",
                                                                                        "Transparency",
                                                                                        "Skeptic Converted"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 800,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 799,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 788,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 778,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 765,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-urgency-scarcity",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Urgency & Scarcity (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-urgency-scarcity",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 821,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 813,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Urgency & Scarcity"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 826,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-urgency-scarcity"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 831,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 830,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 829,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-urgency-scarcity",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Low Stock Warning",
                                                                                        "Price Increase Warning",
                                                                                        "Last Chance",
                                                                                        "Sell-Out Risk",
                                                                                        "Flash Sale"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 847,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 846,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 835,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 825,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 812,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-value-savings",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Value & Savings (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-value-savings",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 868,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 860,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Value & Savings"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 873,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-value-savings"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 878,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 877,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 876,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-value-savings",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Price vs. Value",
                                                                                        "Cost Per Use",
                                                                                        "Competitor Comparison",
                                                                                        "ROI / Pays For Itself",
                                                                                        "Bundle Deal"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 894,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 893,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 882,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 872,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 859,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-curiosity-pattern-interrupt",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Curiosity & Pattern Interrupt (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-curiosity-pattern-interrupt",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 915,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 907,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Curiosity & Pattern Interrupt"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 920,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-curiosity-pattern-interrupt"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 925,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 924,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 923,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-curiosity-pattern-interrupt",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Contrarian Claim",
                                                                                        "Myth Busting",
                                                                                        "Shocking Stat",
                                                                                        "Most People Don't Know",
                                                                                        "Bold Claim"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 941,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 940,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 929,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 919,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 906,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-emotion-story",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Emotion & Story (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-emotion-story",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 962,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 954,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Emotion & Story"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 967,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-emotion-story"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 972,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 971,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 970,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-emotion-story",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Relatable Struggle",
                                                                                        "Personal Confession",
                                                                                        "Vulnerability / Raw Honesty",
                                                                                        "Shared Enemy",
                                                                                        "Underdog Story"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 988,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 987,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 976,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 966,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 953,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-objection-handling",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Objection Handling (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-objection-handling",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1009,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1001,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Objection Handling"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1014,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-objection-handling"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1019,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1018,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1017,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-objection-handling",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Risk Reversal / Guarantee",
                                                                                        "I Thought It Wouldn't Work",
                                                                                        "Works Even If...",
                                                                                        "Too Good to Be True Reframe",
                                                                                        "Price Justification"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1035,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1034,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1023,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1013,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1000,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "product-novelty-positioning",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Novelty & Positioning (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "product-novelty-positioning",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1056,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1048,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Novelty & Positioning"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1061,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "product-novelty-positioning"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1066,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1065,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1064,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "product-novelty-positioning",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Old Way vs. New Way",
                                                                                        "Made Differently",
                                                                                        "The Better Way",
                                                                                        "New Category",
                                                                                        "Upgraded Version"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "primaryAnglesSelected",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1082,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1081,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1070,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1060,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1047,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 666,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            id: "donationAnglesSelectedWrap",
                                                            style: {
                                                                marginTop: 16,
                                                                display: "none"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    style: {
                                                                        margin: "0 0 8px 0",
                                                                        fontSize: 14
                                                                    },
                                                                    children: "Donation Angles (Selected for Donation)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1099,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-urgency-impact",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Urgency & Impact (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-urgency-impact",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1112,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1104,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 10
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Urgency & Impact"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1117,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-urgency-impact"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1122,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1121,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1120,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-urgency-impact",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Deadline/Match Ends Tonight",
                                                                                        "Every Dollar Doubled",
                                                                                        "One Person Can Change This",
                                                                                        "The Cost of Inaction",
                                                                                        "We're Almost There"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1138,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1137,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1126,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1116,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1103,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-emotion-story",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Emotion & Story (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-emotion-story",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1159,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1151,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Emotion & Story"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1164,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-emotion-story"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1169,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1168,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1167,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-emotion-story",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Single Person/Animal Story",
                                                                                        "Before/After (Their Life)",
                                                                                        "The Moment Everything Changed",
                                                                                        "Raw Vulnerability",
                                                                                        "You Were Once Like Them"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1185,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1184,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1173,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1163,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1150,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-social-proof-trust",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Social Proof & Trust (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-social-proof-trust",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1206,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1198,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Social Proof & Trust"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1211,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-social-proof-trust"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1216,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1215,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1214,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-social-proof-trust",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "X,000 People Already Gave",
                                                                                        "Transparency (Where Money Goes)",
                                                                                        "Founder/Insider Story",
                                                                                        "Endorsed by Trusted Name",
                                                                                        "Real Results Shown"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1232,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1231,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1220,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1210,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1197,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-guilt-responsibility",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Guilt & Responsibility (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-guilt-responsibility",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1253,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1245,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Guilt & Responsibility"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1258,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-guilt-responsibility"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1263,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1262,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1261,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-guilt-responsibility",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "You Can't Unsee This",
                                                                                        "Shared Responsibility",
                                                                                        "The Bystander Effect Flip",
                                                                                        "What If It Were You",
                                                                                        "Silence = Complicity"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1279,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1278,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1267,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1257,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1244,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-identity-values",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Identity & Values (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-identity-values",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1300,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1292,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Identity & Values"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1305,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-identity-values"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1310,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1309,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1308,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-identity-values",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Tribe/Community Belonging",
                                                                                        "\"People Like You Give\"",
                                                                                        "Values Alignment",
                                                                                        "Anti-Villain Positioning",
                                                                                        "Be the Hero"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1326,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1325,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1314,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1304,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1291,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-hope-transformation",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Hope & Transformation (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-hope-transformation",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1347,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1339,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Hope & Transformation"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1352,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-hope-transformation"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1357,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1356,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1355,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-hope-transformation",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Dream Outcome for Recipient",
                                                                                        "Light at the End",
                                                                                        "Proof It Works",
                                                                                        "This Is Solvable",
                                                                                        "You're the Missing Piece"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1373,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1372,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1361,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1351,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1338,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-ease-low-barrier",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Ease & Low Barrier (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-ease-low-barrier",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1394,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1386,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Ease & Low Barrier"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1399,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-ease-low-barrier"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1404,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1403,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1402,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-ease-low-barrier",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Just $1 a Day",
                                                                                        "Skip One Coffee",
                                                                                        "No Commitment / Cancel Anytime",
                                                                                        "Takes 60 Seconds",
                                                                                        "Small Gift Big Impact"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1420,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1419,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1408,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1398,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1385,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                                                    "data-angle-category": "donation-exclusivity-recognition",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                                            style: {
                                                                                cursor: "pointer",
                                                                                fontWeight: 900,
                                                                                marginBottom: 6
                                                                            },
                                                                            children: [
                                                                                "Exclusivity & Recognition (",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    "data-angle-summary": "donation-exclusivity-recognition",
                                                                                    children: "0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1441,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                " ",
                                                                                "selected)"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1433,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                marginTop: 14
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        opacity: 0.85,
                                                                                        fontWeight: 700
                                                                                    },
                                                                                    children: "Exclusivity & Recognition"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1446,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        marginTop: 6
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        style: {
                                                                                            display: "flex",
                                                                                            gap: 6,
                                                                                            alignItems: "center",
                                                                                            fontSize: 13
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: "checkbox",
                                                                                                "data-select-all-for": "donation-exclusivity-recognition"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/new/page.tsx",
                                                                                                lineNumber: 1451,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            "Select all"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/new/page.tsx",
                                                                                        lineNumber: 1450,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1449,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    "data-angle-group": "donation-exclusivity-recognition",
                                                                                    style: {
                                                                                        display: "flex",
                                                                                        flexWrap: "wrap",
                                                                                        gap: 10,
                                                                                        marginTop: 8
                                                                                    },
                                                                                    children: [
                                                                                        "Named/Credited Donor",
                                                                                        "Founding Member Status",
                                                                                        "Limited Campaign Window",
                                                                                        "Public Acknowledgment",
                                                                                        "Leave a Legacy"
                                                                                    ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            style: {
                                                                                                display: "flex",
                                                                                                gap: 6,
                                                                                                alignItems: "center",
                                                                                                fontSize: 13
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    name: "donationAnglesSelected[]",
                                                                                                    value: opt
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                                    lineNumber: 1467,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                opt
                                                                                            ]
                                                                                        }, opt, true, {
                                                                                            fileName: "[project]/app/new/page.tsx",
                                                                                            lineNumber: 1466,
                                                                                            columnNumber: 33
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/new/page.tsx",
                                                                                    lineNumber: 1455,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/new/page.tsx",
                                                                            lineNumber: 1445,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/new/page.tsx",
                                                                    lineNumber: 1432,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1095,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 627,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 611,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "ctaStyle",
                                                    children: "CTA Style"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1483,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1484,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "ctaStyle",
                                                    name: "ctaStyle",
                                                    defaultValue: ctaStyleValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Hard sell"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1491,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Soft"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1492,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Mix"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1493,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1485,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 1482,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "visualStyle",
                                                    children: "Visual Style"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1498,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1499,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "visualStyle",
                                                    name: "visualStyle",
                                                    defaultValue: visualStyleValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Minimal"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1506,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Lifestyle"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1507,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Bold DR"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1508,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            children: "Mix"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1509,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1500,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 1497,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "numberOfAds",
                                                    children: "Exact Number of Ads (1–1000)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1514,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1515,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "numberOfAds",
                                                    name: "numberOfAds",
                                                    type: "number",
                                                    min: "1",
                                                    max: "1000",
                                                    step: "1",
                                                    defaultValue: numberOfAdsValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1516,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 1513,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 20
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "referenceImageTypes",
                                                    children: "Reference Image Types Available"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1529,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1532,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "referenceImageTypes",
                                                    name: "referenceImageTypes",
                                                    defaultValue: referenceImageTypesValue,
                                                    style: {
                                                        width: 260,
                                                        padding: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            "data-group": "product",
                                                            children: "Product only"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1539,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            "data-group": "product",
                                                            children: "Lifestyle"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1540,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            "data-group": "product",
                                                            children: "Mix"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1541,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            "data-group": "donation",
                                                            value: "Character",
                                                            children: "Character"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1542,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            "data-group": "donation",
                                                            value: "other",
                                                            children: "other"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/new/page.tsx",
                                                            lineNumber: 1545,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/new/page.tsx",
                                                    lineNumber: 1533,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 1528,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 24
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                style: {
                                                    padding: "10px 14px",
                                                    borderRadius: 10,
                                                    border: "1px solid rgba(124, 58, 237, 0.35)",
                                                    background: "var(--accent)",
                                                    color: "#fff",
                                                    cursor: "pointer"
                                                },
                                                children: "Create Campaign"
                                            }, void 0, false, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1552,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/new/page.tsx",
                                            lineNumber: 1551,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/new/page.tsx",
                                    lineNumber: 437,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/new/page.tsx",
                            lineNumber: 208,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 207,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        style: {
                            position: "sticky",
                            top: 110,
                            alignSelf: "start",
                            display: "flex",
                            flexDirection: "column",
                            gap: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    border: "1px solid var(--border)",
                                    borderRadius: 16,
                                    padding: 16,
                                    background: "var(--surface)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 900
                                        },
                                        children: "Campaign Summary"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 1588,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 10,
                                            fontSize: 13,
                                            opacity: 0.85
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    "Type:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        id: "sidebarCampaignType",
                                                        children: "Product"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/new/page.tsx",
                                                        lineNumber: 1592,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1590,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: [
                                                    "Creative Mode:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        id: "sidebarCreativeMode",
                                                        children: "Mix"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/new/page.tsx",
                                                        lineNumber: 1599,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1597,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: [
                                                    "Ad Mix Strategy:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        id: "sidebarAdMixStrategy",
                                                        children: "Even Mix"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/new/page.tsx",
                                                        lineNumber: 1603,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1601,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: [
                                                    "Selected Angles:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        id: "sidebarTotalAnglesSelectedCounter",
                                                        children: "0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/new/page.tsx",
                                                        lineNumber: 1607,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1605,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: [
                                                    "Platform:",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        id: "sidebarPlatform",
                                                        children: "Meta"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/new/page.tsx",
                                                        lineNumber: 1613,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1611,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: [
                                                    "Ads: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        id: "sidebarNumberOfAds",
                                                        children: "6"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/new/page.tsx",
                                                        lineNumber: 1616,
                                                        columnNumber: 38
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1615,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 1589,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 1580,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    border: "1px solid var(--border)",
                                    borderRadius: 16,
                                    padding: 16,
                                    background: "var(--surface)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 900
                                        },
                                        children: "Tips for Best Results"
                                    }, void 0, false, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 1629,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 10,
                                            fontSize: 13,
                                            opacity: 0.85,
                                            lineHeight: 1.5
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Explore = broad testing."
                                            }, void 0, false, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1631,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: "Scale Winners = tighter proven variations."
                                            }, void 0, false, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1634,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: "Mix = balanced default."
                                            }, void 0, false, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1637,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 10
                                                },
                                                children: "Leave angles blank + use Mix to generate a broad test batch."
                                            }, void 0, false, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1640,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: 6
                                                },
                                                children: "Use strict angles when scaling known winners."
                                            }, void 0, false, {
                                                fileName: "[project]/app/new/page.tsx",
                                                lineNumber: 1643,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/new/page.tsx",
                                        lineNumber: 1630,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/new/page.tsx",
                                lineNumber: 1621,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/new/page.tsx",
                        lineNumber: 1570,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/new/page.tsx",
                lineNumber: 199,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/new/page.tsx",
        lineNumber: 188,
        columnNumber: 9
    }, this);
}
}),
"[project]/.next-internal/server/app/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/new/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/new/page.tsx [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/new/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40730f95c785369b4ed2e31e5d2ca0bfdd6084b025",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$new$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/new/page/actions.js { ACTIONS_MODULE0 => "[project]/app/new/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$new$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/new/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_11c568d4._.js.map
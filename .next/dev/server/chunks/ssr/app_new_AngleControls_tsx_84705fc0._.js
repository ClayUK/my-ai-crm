module.exports = [
"[project]/app/new/AngleControls.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AngleControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function AngleControls() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let rafId = null;
        const initOnce = ()=>{
            const select = document.getElementById("campaignType");
            const referenceSelect = document.getElementById("referenceImageTypes");
            if (!select || !referenceSelect) {
                rafId = window.setTimeout(initOnce, 50);
                return;
            }
            const alreadyAttached = select.dataset.ssAngleControlsAttached === "1";
            const sync = ()=>{
                const wrap = document.getElementById("primaryAnglesSelectedWrap");
                const donationWrap = document.getElementById("donationAnglesSelectedWrap");
                const donationSubjectWrap = document.getElementById("donationSubjectWrap");
                const donationTemplatesWrap = document.getElementById("donationTemplatesWrap");
                const isProduct = select.value === "product";
                const isDonation = select.value === "donation";
                if (wrap) wrap.style.display = isProduct ? "block" : "none";
                if (donationWrap) donationWrap.style.display = isDonation ? "block" : "none";
                if (donationSubjectWrap) donationSubjectWrap.style.display = isDonation ? "block" : "none";
                if (donationTemplatesWrap) donationTemplatesWrap.style.display = "none";
                const fieldsCard = document.getElementById("createCampaignFieldsCard");
                if (fieldsCard) {
                    const allowedDonationIds = new Set([
                        "campaignTypeBlock",
                        "donationSubjectWrap",
                        "createCampaignSubmitBlock"
                    ]);
                    const children = Array.from(fieldsCard.children);
                    for (const child of children){
                        if (isDonation) {
                            const shouldShow = child.id && allowedDonationIds.has(child.id);
                            child.style.display = shouldShow ? "block" : "none";
                        } else {
                            child.style.display = "block";
                        }
                    }
                }
                if (donationSubjectWrap) {
                    const intakeBackstory = document.getElementById("donationInitialBackstoryBlock");
                    const intakeReferences = document.getElementById("donationInitialReferenceBlock");
                    const donationGrid = document.getElementById("donationSubjectFieldsGrid");
                    const allBlocks = Array.from((donationGrid || donationSubjectWrap).querySelectorAll(":scope > div"));
                    for (const block of allBlocks){
                        if (!isDonation) {
                            block.style.display = "block";
                            const elements = Array.from(block.querySelectorAll("input, select, textarea"));
                            for (const el of elements)el.disabled = false;
                            continue;
                        }
                        const keep = block.id === "donationInitialBackstoryBlock" || block.id === "donationInitialReferenceBlock";
                        block.style.display = keep ? "block" : "none";
                        const elements = Array.from(block.querySelectorAll("input, select, textarea"));
                        for (const el of elements)el.disabled = !keep;
                    }
                    // Ensure intake anchors stay visible if present.
                    if (isDonation && intakeBackstory) intakeBackstory.style.display = "block";
                    if (isDonation && intakeReferences) intakeReferences.style.display = "block";
                }
                const productInputs = Array.from(document.querySelectorAll('input[name="primaryAnglesSelected"]'));
                const donationInputs = Array.from(document.querySelectorAll('input[name="donationAnglesSelected[]"]'));
                for (const input of productInputs)input.disabled = !isProduct;
                for (const input of donationInputs)input.disabled = !isDonation;
                // Enable/disable reference-image options per campaign type.
                const group = isDonation ? "donation" : "product";
                const options = Array.from(referenceSelect.querySelectorAll("option"));
                let firstEnabledValue = null;
                for (const opt of options){
                    const optGroup = opt.getAttribute("data-group");
                    const enabled = optGroup === group;
                    opt.disabled = !enabled;
                    if (enabled && !firstEnabledValue) firstEnabledValue = opt.value;
                }
                const selected = referenceSelect.selectedOptions && referenceSelect.selectedOptions[0];
                const selectedEnabled = selected ? !selected.disabled : false;
                if (!selectedEnabled && firstEnabledValue) {
                    referenceSelect.value = firstEnabledValue;
                }
                // Sidebar summary (best-effort; ignore if elements not present).
                const sidebarType = document.getElementById("sidebarCampaignType");
                if (sidebarType) sidebarType.textContent = isDonation ? "Donation" : "Product";
                const creativeModeSelect = document.getElementById("creativeMode");
                const sidebarCreativeMode = document.getElementById("sidebarCreativeMode");
                if (sidebarCreativeMode && creativeModeSelect) {
                    sidebarCreativeMode.textContent = creativeModeSelect.value || "";
                }
                const adMixStrategySelect = document.getElementById("adMixStrategy");
                const sidebarAdMixStrategy = document.getElementById("sidebarAdMixStrategy");
                if (sidebarAdMixStrategy && adMixStrategySelect) {
                    sidebarAdMixStrategy.textContent = adMixStrategySelect.value || "";
                }
                const platformSelect = document.getElementById("platform");
                const sidebarPlatform = document.getElementById("sidebarPlatform");
                if (platformSelect) platformSelect.disabled = isDonation;
                if (sidebarPlatform) {
                    if (isDonation) {
                        const donationPlatformChecks = Array.from(document.querySelectorAll('input[type="checkbox"][name="donationPlatforms[]"]'));
                        const selected = donationPlatformChecks.filter((c)=>c.checked && !c.disabled).map((c)=>c.value);
                        sidebarPlatform.textContent = selected.length ? selected.join(", ") : "";
                    } else if (platformSelect) {
                        sidebarPlatform.textContent = platformSelect.value || "";
                    } else {
                        sidebarPlatform.textContent = "";
                    }
                }
                const numberOfAdsInput = document.getElementById("numberOfAds");
                const sidebarNumberOfAds = document.getElementById("sidebarNumberOfAds");
                if (sidebarNumberOfAds && numberOfAdsInput) {
                    sidebarNumberOfAds.textContent = numberOfAdsInput.value || "";
                }
                // Donation-only: create ads sequentially (one at a time).
                if (isDonation && numberOfAdsInput) {
                    numberOfAdsInput.value = "1";
                    numberOfAdsInput.disabled = true;
                } else if (numberOfAdsInput) {
                    numberOfAdsInput.disabled = false;
                }
                // Hide reference warning after user uploads files.
                const donationRefInput = document.getElementById("reference_images");
                const donationRefWarning = document.getElementById("donationReferenceImagesWarning");
                if (donationRefInput && donationRefWarning) {
                    const fileCount = donationRefInput.files?.length || 0;
                    donationRefWarning.style.display = fileCount > 0 ? "none" : "block";
                }
                refreshAngleUiCounters();
            };
            const refreshAngleUiCounters = ()=>{
                const totalEl = document.getElementById("totalAnglesSelectedCounter");
                const sidebarTotalEl = document.getElementById("sidebarTotalAnglesSelectedCounter");
                const memberBoxes = Array.from(document.querySelectorAll('input[type="checkbox"][name="primaryAnglesSelected"], input[type="checkbox"][name="donationAnglesSelected[]"]'));
                const totalSelected = memberBoxes.filter((b)=>b.checked && !b.disabled).length;
                if (totalEl) totalEl.textContent = String(totalSelected);
                if (sidebarTotalEl) sidebarTotalEl.textContent = String(totalSelected);
                const groupEls = Array.from(document.querySelectorAll("[data-angle-group]"));
                for (const groupEl of groupEls){
                    const groupKey = groupEl.getAttribute("data-angle-group");
                    if (!groupKey) continue;
                    const groupMembers = Array.from(groupEl.querySelectorAll('input[type="checkbox"][name="primaryAnglesSelected"], input[type="checkbox"][name="donationAnglesSelected[]"]'));
                    const selectedCount = groupMembers.filter((b)=>b.checked && !b.disabled).length;
                    const summarySpan = document.querySelector(`[data-angle-summary="${groupKey}"]`);
                    if (summarySpan) summarySpan.textContent = String(selectedCount);
                }
            };
            const wireAngleSelectAll = ()=>{
                const selectAllBoxes = Array.from(document.querySelectorAll('input[data-select-all-for]'));
                for (const selectAllBox of selectAllBoxes){
                    const groupKey = selectAllBox.getAttribute("data-select-all-for") || "";
                    if (!groupKey) continue;
                    const selector = `[data-angle-group="${groupKey}"]`;
                    const groupEl = document.querySelector(selector);
                    if (!groupEl) continue;
                    const memberBoxes = Array.from(groupEl.querySelectorAll('input[type="checkbox"][name="primaryAnglesSelected"], input[type="checkbox"][name="donationAnglesSelected[]"]'));
                    if (memberBoxes.length === 0) continue;
                    const updateFromMembers = ()=>{
                        const checkedCount = memberBoxes.filter((b)=>b.checked).length;
                        const total = memberBoxes.length;
                        selectAllBox.indeterminate = checkedCount > 0 && checkedCount < total;
                        selectAllBox.checked = checkedCount === total && total > 0;
                        refreshAngleUiCounters();
                    };
                    selectAllBox.addEventListener("click", ()=>{
                        const nextChecked = selectAllBox.checked;
                        for (const member of memberBoxes)member.checked = nextChecked;
                        window.setTimeout(updateFromMembers, 0);
                    });
                    for (const member of memberBoxes){
                        member.addEventListener("click", updateFromMembers);
                    }
                    updateFromMembers();
                }
            };
            const expandBtn = document.getElementById("expandAllPrimaryAnglesBtn");
            const collapseBtn = document.getElementById("collapseAllPrimaryAnglesBtn");
            const setAll = (open)=>{
                const sections = Array.from(document.querySelectorAll('details[data-angle-category]'));
                for (const sec of sections)sec.open = open;
            };
            if (expandBtn) expandBtn.addEventListener("click", ()=>setAll(true));
            if (collapseBtn) collapseBtn.addEventListener("click", ()=>setAll(false));
            if (alreadyAttached) {
                sync();
                return;
            }
            select.dataset.ssAngleControlsAttached = "1";
            select.addEventListener("change", sync);
            select.addEventListener("input", sync);
            // Donation template + file inputs: keep derived UI in sync.
            const donationRefInput = document.getElementById("reference_images");
            if (donationRefInput) {
                donationRefInput.addEventListener("change", sync);
            }
            const donationTemplateChecks = document.querySelectorAll('input[type="checkbox"][name="selected_templates[]"]');
            for (const cb of Array.from(donationTemplateChecks)){
                cb.addEventListener("click", sync);
            }
            // Attach select-all wiring once at mount.
            wireAngleSelectAll();
            // Initial render state.
            sync();
        };
        initOnce();
        return ()=>{
            if (rafId) window.clearTimeout(rafId);
        };
    }, []);
    return null;
}
}),
];

//# sourceMappingURL=app_new_AngleControls_tsx_84705fc0._.js.map
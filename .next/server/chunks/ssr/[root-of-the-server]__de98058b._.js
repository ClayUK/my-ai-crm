module.exports=[63021,(a,b,c)=>{b.exports=a.x("@prisma/client-2c3a283f134fdcb6",()=>require("@prisma/client-2c3a283f134fdcb6"))},66518,a=>{"use strict";var b=a.i(63021);let c=globalThis.prisma??new b.PrismaClient;a.s(["prisma",0,c])},37936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"registerServerReference",{enumerable:!0,get:function(){return d.registerServerReference}});let d=a.r(11857)},65070,a=>{"use strict";var b=a.i(66518);let c="fundraiser",d="Restart the dev server after running: npx prisma generate && npx prisma db push";function e(a){switch(a){case"1":default:return"UGC SNAPCHAT";case"2":return"NATIVE ORGANIC";case"3":return"HYPER REALISTIC CLICKBAIT";case"4":return"CREATIVE CONCEPT";case"5":return"ILLUSTRATED AI";case"6":return"KLING VIDEO READY"}}let f={1:"UGC_SNAPCHAT",2:"NATIVE_ORGANIC",3:"HYPER_CLICKBAIT",4:"CREATIVE_CONCEPT",5:"ILLUSTRATED",6:"KLING_VIDEO"},g=["VAR_HIGHER_AGGRESSION","VAR_LOWER_AGGRESSION","VAR_ADD_TEXT","VAR_NO_TEXT","VAR_STRONGER_CTA","VAR_HIGHER_QUALITY","VAR_BEFORE_AFTER"];function h(a){let{keyed:b}=i(a),c=[];for(let a of b.keys())a.startsWith("VAR_")&&c.push(a);return c.length>0?c:[...g]}function i(a){let b=[],c=new Map;for(let d of(a||"").split(/\r?\n/)){let a=d.trim();if(!a||a.startsWith("#"))continue;let e=a.indexOf("=");if(e<=0){b.push(a);continue}let f=a.slice(0,e).trim().toUpperCase().replace(/\s+/g,"_"),g=a.slice(e+1).trim();f&&c.set(f,g)}return{globalLines:b,keyed:c}}function j(a,b){if(!a)return"";let c=(a.previousWinningPrompts||"").trim(),d=(a.anglesList||"").trim(),{globalLines:e,keyed:f}=i(a.additionalInfo||""),g=new Set(b.map(a=>a.trim().toUpperCase().replace(/\s+/g,"_"))),h=[];for(let a of g){let b=f.get(a);b&&h.push(`${a}: ${b}`)}let j=e.length>0?`
GLOBAL CREATIVE NOTES:
${e.join("\n")}`:"",k=h.length>0?`
ACTIVE STYLE / OPTION INSTRUCTIONS (apply these strictly):
${h.join("\n\n")}`:"";return`
=== FUNDRAISER CREATIVE BRAIN (Memory) ===
Use these as patterns and ingredients. Do not copy verbatim — adapt to this fundraiser.

PREVIOUS WINNING PROMPTS (examples):
${c||"(none saved)"}

ANGLE LIST (rotate / prioritize; avoid repeating the same angle across ads in one batch):
${d||"(none saved)"}
${k}
${j}
=== END BRAIN ===
`.trim()}function k(a){if(!a)return"";let b=(a.previousWinningPrompts||"").trim(),c=(a.anglesList||"").trim(),{globalLines:d}=i(a.additionalInfo||""),e=d.length>0?`
GLOBAL CREATIVE NOTES:
${d.join("\n")}`:"";return`
=== FUNDRAISER CREATIVE BRAIN (Memory) ===
Use these as patterns and ingredients. Do not copy verbatim — adapt to this fundraiser.

PREVIOUS WINNING PROMPTS (examples):
${b||"(none saved)"}

ANGLE LIST (rotate / prioritize; avoid repeating the same angle across ads in one batch):
${c||"(none saved)"}
${e}
`.trim()}function l(a,b){if(!a)return"";let{keyed:c}=i(a.additionalInfo||""),d=new Set(b.map(a=>a.trim().toUpperCase().replace(/\s+/g,"_"))),e=[];for(let a of d){let b=c.get(a);b&&e.push(`${a}: ${b}`)}return 0===e.length?"":`ACTIVE STYLE / OPTION INSTRUCTIONS (apply strictly for this slot):
${e.join("\n\n")}`}async function m(){let a=b.prisma.creativeBrain;if(!a)return console.error(`[creativeBrain] prisma.creativeBrain is missing. ${d}`),null;let e=await a.findUnique({where:{scope:c}});return e?{previousWinningPrompts:e.previousWinningPrompts,anglesList:e.anglesList,additionalInfo:e.additionalInfo}:null}function n(a,b,c=Math.random,d=[]){let e=[...(a||"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean),...(d||[]).map(a=>a.trim()).filter(Boolean)],f=[];for(let a=0;a<b;a++){if(0===e.length){f.push("");continue}f.push(e[Math.floor(c()*e.length)])}return f}function o(a,b){for(let c=a.length-1;c>0;c--){let d=Math.floor(b()*(c+1));[a[c],a[d]]=[a[d],a[c]]}}function p(a,b=Math.random,c){let d=(a||"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean),e=["1","2","3","4","5"];o(e,b);let h=c?.varKeyPool?.filter(Boolean).length?[...c.varKeyPool]:[...g];0===h.length&&(h=[...g]);let i=[];for(let a=0;a<5;a++){let c=e[a%e.length],g=f[c]||"UGC_SNAPCHAT",j=d.length>0?d[Math.floor(b()*d.length)]:"",k=[...h];o(k,b);let l=Math.floor(4*b()),m=function(a,b){let c=new Set(a);return c.has("VAR_ADD_TEXT")&&c.has("VAR_NO_TEXT")&&(.5>b()?c.delete("VAR_NO_TEXT"):c.delete("VAR_ADD_TEXT")),Array.from(c)}(k.slice(0,l),b),n=[g,...m];i.push({slotIndex:a+1,styleTemplateId:c,brainTemplateKey:g,angleLine:j,varKeys:m,activeBrainKeys:n})}return i}function q(a){if(!a?.trim())return{batches:[]};try{let b=JSON.parse(a);if(!b||!Array.isArray(b.batches))return{batches:[]};return b}catch{return{batches:[]}}}function r(a,b,c){let d=q(a);for(d.batches.push({at:new Date().toISOString(),...c&&c.length?{plan:c}:{},ads:b.map(a=>({hook:a.hook?.slice(0,120),angle:a.angle?.slice(0,120),templateId:a.templateId}))});d.batches.length>12;)d.batches.shift();return JSON.stringify(d)}function s(a){if(!a.batches.length)return"(no prior batches on this campaign)";let b=[];for(let c of a.batches.slice(-6))for(let a of c.ads)b.push(`- ${a.templateId||"?"} | ${(a.angle||"").slice(0,80)} | ${(a.hook||"").slice(0,80)}`);return b.join("\n")||"(empty)"}a.s(["CREATIVE_BRAIN_PRISMA_FIX",0,d,"FUNDRAISER_BRAIN_SCOPE",0,c,"appendFundraiserBatchHistory",()=>r,"buildBrainKeyedInstructions",()=>l,"buildBrainPromptSection",()=>j,"buildBrainStaticPreamble",()=>k,"donationStyleTemplateLabel",()=>e,"formatBatchHistoryForPrompt",()=>s,"getFundraiserCreativeBrain",()=>m,"parseFundraiserBatchHistory",()=>q,"pickRandomWinningPromptSeeds",()=>n,"planFundraiserBatchOfFive",()=>p,"resolveVarKeyPoolFromAdditionalInfo",()=>h])},13095,(a,b,c)=>{"use strict";function d(a){for(let b=0;b<a.length;b++){let c=a[b];if("function"!=typeof c)throw Object.defineProperty(Error(`A "use server" file can only export async functions, found ${typeof c}.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value`),"__NEXT_ERROR_CODE",{value:"E352",enumerable:!1,configurable:!0})}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ensureServerEntryExports",{enumerable:!0,get:function(){return d}})}];

//# sourceMappingURL=%5Broot-of-the-server%5D__de98058b._.js.map
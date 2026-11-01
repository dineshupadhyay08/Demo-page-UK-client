// Offline review only. Never writes to public/ or changes publication approval.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
const articles = JSON.parse(fs.readFileSync(new URL("../src/content/journal/articles.json", import.meta.url), "utf8"));
const escape = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const output = path.join(os.tmpdir(), "footwell-journal-clinical-review.html");
const html = articles.map(a => {
  const asset = fs.readFileSync(new URL(`../public${a.image.src}`, import.meta.url));
  const revision = createHash("sha256").update(JSON.stringify({title:a.title,excerpt:a.excerpt,category:a.category,tags:a.tags,overview:a.overview,sections:a.sections,faqs:a.faqs,references:a.references,image:a.image,seoDescription:a.seoDescription})).digest("hex");
  return `<article><p class="notice">UNPUBLISHED · ${escape(a.status)} · Clinical review and image-rights approval required</p><h1>${escape(a.title)}</h1><p>${escape(a.excerpt)}</p><img alt="${escape(a.image.alt)}" src="data:image/${a.image.src.endsWith('.webp')?'webp':'jpeg'};base64,${asset.toString('base64')}"><p>${escape(a.image.source)} ${escape(a.image.rights)}</p>${a.overview ? `<h2>At a glance</h2><ul>${a.overview.map(p=>`<li>${escape(p)}</li>`).join('')}</ul>` : ''}${a.sections.map(s=>`<h2>${escape(s.heading)}</h2>${s.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}${s.comparison ? `<table><caption>Prefabricated and custom orthoses</caption><tr><th>Consideration</th><th>Prefabricated</th><th>Custom</th></tr>${s.comparison.map(r=>`<tr><th>${escape(r.label)}</th><td>${escape(r.prefabricated)}</td><td>${escape(r.custom)}</td></tr>`).join('')}</table>` : ''}<small>Sources: ${s.references.join(', ')}</small>`).join('')}<h2>Questions</h2>${a.faqs.map(f=>`<h3>${escape(f.question)}</h3><p>${escape(f.answer)}</p>`).join('')}<h2>References</h2><ol>${a.references.map(r=>`<li><a href="${escape(r.url)}">${escape(r.organisation)}: ${escape(r.title)}</a></li>`).join('')}</ol><p>Review fingerprint (changes when content or image approval changes): <code>${revision}</code></p></article>`;
}).join('');
fs.writeFileSync(output, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Footwell — private clinical review</title><style>body{margin:auto;max-width:800px;padding:24px;background:#f7f5ef;color:#103d38;font:18px/1.8 Georgia,serif}article{margin-bottom:100px}img{width:100%;border-radius:20px}.notice{font:14px/1.5 sans-serif;background:#fff;padding:16px;border:1px solid}code{overflow-wrap:anywhere;font-size:12px}a{color:inherit}</style>${html}</html>`);
console.log(`Offline review file: ${output}`);
console.log("Publication requires genuine practitioner approval, image permission, review metadata and matching content fingerprint. Configure SITE_URL to the verified HTTPS production origin before indexing. No approvals were granted by this script.");

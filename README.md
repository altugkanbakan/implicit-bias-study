# Implicit Bias in Emergency Clinical Decision-Making: Randomization Infrastructure

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/automation-n8n-orange)](https://n8n.io)
[![Cloudflare Workers](https://img.shields.io/badge/edge-Cloudflare%20Workers-orange)](https://workers.cloudflare.com)
[![DOI](https://zenodo.org/badge/1174939018.svg)](https://doi.org/10.5281/zenodo.20825869)

> Technical infrastructure for a prospective, randomized controlled, double-blind, 2×2 factorial vignette study examining implicit bias in emergency pain management decisions.

---

## Overview

This repository contains the complete technical stack used to implement automated, blind randomization for an online vignette study. The system was designed to meet three core methodological requirements:

1. **True randomization** — participants are assigned to study arms without investigator involvement
2. **Double-blinding** — participants cannot identify their assigned arm; all four study arms are visually identical
3. **Full anonymity** — no personally identifiable information (name, IP address, email) is collected or stored at any stage

---

## Study Design

**Design:** Prospective, randomized controlled, double-blind, 2×2 factorial experimental vignette study

**Research Question:** Do medical students exhibit implicit bias in analgesic prescribing decisions when presented with patients bearing substance-abuse-associated visual characteristics?

### 2×2 Factorial Structure

|  | **Objective Pain Source** (e.g., ankle fracture) | **Subjective Pain Source** (e.g., renal colic) |
|--|--|--|
| **Substance abuse-associated appearance** | Arm 1 | Arm 2 |
| **Non-Substance abuse appearance** | Arm 3 | Arm 4 |

The critical bias detection comparison is **Arm 2 vs. Arm 4**: identical clinical presentation (renal colic), differing only in patient visual appearance.

Patient images were synthetically generated using MidJourney v6 (Midjourney Inc.) to ensure privacy compliance while maintaining experimental control over visual characteristics.

---

## System Architecture

```
Participant scans QR code / opens link
            ↓
  Cloudflare Worker (XYZ.com/page)
  — masks n8n infrastructure from participants
            ↓
     GET /informedconsent → n8n serves informed consent HTML page
            ↓
  Participant reads consent and clicks "I agree"
            ↓
     POST /informedconsent → n8n executes block randomization
            ↓
  ┌─────────────────────────────────┐
  │  Assigns participant to Arm 1–4 │
  │  Generates anonymous UUID       │
  │  Logs to Google Sheets          │
  └─────────────────────────────────┘
            ↓
  Participant is silently redirected
  to their assigned JotForm survey
```

---

## Technical Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Automation & webhook | [n8n](https://n8n.io) (Cloud) | Randomization logic, routing, logging |
| Edge proxy | [Cloudflare Workers](https://workers.cloudflare.com) | URL masking, SSL termination, CORS handling |
| Informed consent UI | Vanilla HTML/CSS/JS | Consent page served dynamically by n8n |
| Data collection | [JotForm](https://jotform.com) | Four independent survey forms (one per arm) |
| Randomization log | Google Sheets | Real-time arm balance monitoring |

---

## Randomization Algorithm

Block randomization with a fixed block size of 4 was implemented using the Fisher-Yates shuffle algorithm. This ensures perfect arm balance at every fourth participant while maintaining allocation concealment.

```javascript
// Block randomization — Fisher-Yates shuffle
const arms = [1, 2, 3, 4];
for (let i = arms.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [arms[i], arms[j]] = [arms[j], arms[i]];
}
```

Arm counts and the running participant total are persisted in n8n's built-in Static Data store, ensuring state is maintained across sessions without a dedicated database.

Each participant receives an anonymous UUID (format: `P-XXXX-XXXX-XXXX`) generated at the time of assignment. This ID appears in the Google Sheets log alongside arm assignment and timestamp, but contains no personal information.

---

## Repository Structure

```
├── README.md                        # This file
├── n8n_workflow.json                # Importable n8n workflow
├── cloudflare_worker.js             # Cloudflare Worker edge proxy script
└── consent_page/
    └── informedconsent.html         # Informed consent HTML page
```

---

## Replication Guide

### Prerequisites

- [n8n Cloud](https://n8n.io) account (or self-hosted n8n instance)
- [Cloudflare](https://cloudflare.com) account with a domain under Cloudflare DNS
- Google account (for Sheets logging)
- Four JotForm survey forms (one per study arm)

### Step 1 — Import the n8n Workflow

1. Open n8n → **Workflows → Import from file**
2. Upload `n8n_workflow.json`
3. In the **Randomization & Generate ID** (Code) node, replace the four `formUrls` values with your own JotForm links
4. Connect your Google Sheets credential and update the Sheet ID
5. **Activate** the workflow (toggle top-right) — note the Production webhook URL

### Step 2 — Deploy the Cloudflare Worker

1. Cloudflare Dashboard → **Workers & Pages → Create Worker**
2. Paste the contents of `cloudflare_worker.js`
3. Update `N8N_BASE_URL` with your n8n Production webhook URL
4. Deploy and add a route: `yourdomain.com/calisma*`
5. Add a DNS AAAA placeholder record if needed: `@ → 100:: (Proxied)`

### Step 3 — Consent Page

The consent page (`informedconsent.html`) is served dynamically by the n8n GET webhook — no separate hosting is required. The Cloudflare Worker automatically rewrites all internal URLs so the n8n domain is never exposed to participants.

---

## Privacy & Ethics

- No IP addresses, email addresses, or any personally identifiable information are collected
- Participant identifiers are randomly generated UUIDs with no link to real-world identity
- The study was conducted in accordance with the Declaration of Helsinki
- Ethical approval: *Ufuk University Clinical/Non-interventional Research Ethics Committee; approval no 26.02.27.05/04 and date 02.27.2026*
- Acknowledgment: This study supported by the *Ufuk University Scientific Research Projects (BAP) program (UFUK-BAP-2026-004).*

---

## Citation

If you use this infrastructure in your own research, please cite:

```bibtex
@misc{kanbakan2026implicitbias,
  author       = {Kanbakan, Altuğ},
  title        = {Randomization Infrastructure for Double-Blind Online Vignette Studies},
  year         = {2026},
  publisher    = {GitHub},
  url          = {https://github.com/altugkanbakan/[repo-name]}
}
```

*Full study citation will be updated upon publication.*

---

## License

This project is licensed under the MIT License — you are free to use, adapt, and redistribute this infrastructure for your own research.

---

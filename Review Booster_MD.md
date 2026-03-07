**Review Booster — Product Requirements Document (PRD)**

**1. Product summary**

A lightweight SaaS that converts in-restaurant QR scans into public positive reviews and private negative-feedback channels for owners. Public 4–5★ flows drive reviews to Google Maps; 1–3★ flows capture structured feedback and deliver it privately to the owner via WhatsApp (or a configurable private channel). The system also issues unique, single-use coupon codes after feedback and provides analytics and automated re-engagement campaigns (opt-in).

**2. Goals \& success metrics**

Deliver measurable increase in public Google reviews for merchants (+X reviews/month).

Reduce negative public reviews by capturing complaints privately (target: ≥70% of unhappy customers report privately).

Owner retention via MRR (target: 5–10% conversion from free trial to paid).

Key metrics: scans/day, conversion-to-review (%), negative-feedback resolution SLA, coupon redemption rate, monthly active merchants, churn.





**3. Users \& personas**

Restaurant Owner / Manager — monitors dashboard, receives alerts, resolves complaints, sends campaigns.

Floor staff — sets up QR cards/stickers, redeems coupons.

End customer — scans QR, submits rating/feedback, optionally claims coupon.

System admin — platform management, billing, compliance.





**4. MVP scope (must-have)**

Merchant onboarding (web portal) with QR generation and printable asset (PNG/SVG).

Public 4–5★ flow: “Thanks — would you share on Google?” → direct user to Google Maps review link.

Private 1–3★ flow: feedback form → structured fields (issue category, text) → immediate private alert to owner (WhatsApp or email).

Unique coupon generation and validation (single-use or expiry-based).

Owner dashboard: real-time scan counts, feedback inbox, coupon list, simple analytics.

Data capture with explicit opt-in for phone number (consent capture + T\&Cs).

Basic subscription \& billing integration (stripe or later).

Audit logging and basic security (HTTPS, hashed secrets).







**5. User flows (detailed)**



**A. Merchant onboarding**

Owner registers (name, business name, address, Google Maps place ID optional, contact phone, business hours).

System generates merchant\_id, dashboard, and QR asset: stable URL https://app/review/<merchant\_hash>.

Owner receives printable sticker template with merchant-specific QR and call-to-action text.



**B. Customer scan flow**

Scan QR → lightweight web page (no install) loads.

Prompt: 1–5 star rating.

If 4–5 → show “Thank you” + CTA button linking to merchant’s Google review page. After click, show coupon code.

If 1–3 → show short feedback form (category, comments, optional phone). On submit, show coupon code and confirmation.

After any submission, show short confirmation and coupon code. Optionally ask to subscribe for offers (opt-in checkbox).



**C. Private alert for unhappy customers**

On negative feedback submit → system enqueues a private alert to owner with feedback summary and a deep link to the dashboard thread. Delivery channel: WhatsApp Business API (preferred) or SMS/email fallback.



**D. Coupon lifecycle**

On submission: create coupon record (code, merchant\_id, expiry, redemption\_limit).

Owner redeems via POS or front-line app (web verification or API). Redemption decrements limit; dashboard shows status.



**E. Campaigns \& retargeting (post-MVP)**

Owner schedules one-off or template campaigns (e.g., festival offers) to opt-in customers via WhatsApp templates or SMS. Includes suppression rules and unsubscribe management.





**6. Data Model (Firebase version)**



**Instead of relational tables, the system will use NoSQL collections in Cloud Firestore.**



**Collections Structure**



**merchants:**



**merchants**

   **merchant\_id**

      **name**

      **business\_name**

      **address**

      **google\_place\_id**

      **phone**

      **plan**

      **created\_at**



**qr\_codes:**



 qr\_codes

   qr\_id

      merchant\_id

      qr\_hash

      created\_at

      active



**scans:**



**scans**

   **scan\_id**

      **merchant\_id**

      **qr\_id**

      **timestamp**

      **device**

      **location**



**feedback:**



**feedback**

   **feedback\_id**

      **merchant\_id**

      **stars**

      **category**

      **comment**

      **phone**

      **consent\_flag**

      **created\_at**

      **status**



**coupons:**



**coupons**

   **coupon\_id**

      **merchant\_id**

      **code**

      **issued\_at**

      **expires\_at**

      **redeemed\_at**

      **status**



**campaign\_subscribers:**



**campaign\_subscribers**

   **subscriber\_id**

      **merchant\_id**

      **phone**

      **consent**

      **created\_at**







**7. API surface (examples, Flask-style)**



POST /api/merchants — create merchant (onboard).

GET /r/<qr\_hash> — landing page for scan (public).

POST /api/feedback — submit rating/feedback (accepts qr\_hash, stars, comment, phone\_opt\_in).

POST /api/coupons/validate — validate coupon code (for POS).

GET /api/merchant/<id>/dashboard — owner dashboard data.

POST /api/merchant/<id>/campaigns — schedule campaign (later).

Implementation: return JSON, use token-based auth (JWT) for owner APIs. Rate-limit public endpoints.





**8. Integrations (Firebase compatible)**



**Google Reviews:**

Redirect users to the merchant review page using the stored google\_place\_id through

Google Maps.



**Owner Alerts**:

Negative feedback notifications are delivered through

WhatsApp Business API.



**Messaging Automation**:

Campaigns will be triggered via Firebase Cloud Functions.







**9. Security \& privacy requirements**



All traffic over HTTPS.

Store PII (phones) encrypted at rest (AES-256); access controlled. Hash phone numbers for deduplication.

Explicit consent capture checkbox before storing phone number; show privacy policy.

Data retention policy: default keep PII 12 months; allow merchants to request deletions.

Role-based access control for owner dashboard.

Rate limiting and bot detection on public scan endpoint to prevent fraud.

Audit logs for all coupon issuances and redemptions.







**10. Compliance \& operational constraints**



Opt-in compliance for messaging channels (WhatsApp template approval, local telecom rules).

Respect local spam and consumer protection laws for campaign messages.

Provide unsubscribe mechanism for marketing messages and honor immediately.







**11. Analytics \& reporting (dashboard)**



Real-time scan counts and trend graphs (daily/weekly/monthly).

Conversion funnel: scans → feedback submitted → review click (Google) → coupon issued → coupon redeemed.

Feedback inbox with categories and status (new, in-progress, resolved).

Export: CSV/Excel of feedback and coupon redemptions.

Alerts: thresholds (e.g., 5 negative feedbacks in 24h) trigger immediate owner notification.







12\. Acceptance criteria (MVP)



Merchant can onboard and receive a QR asset and dashboard.

Scan flow loads <2s on a 2G mobile connection.

4–5★ users are redirected to the merchant Google review link reliably.

1–3★ feedback is delivered privately to owner via configured channel within 60 seconds.

Coupons issued are unique, verifiable, and redeemable via API or dashboard.

Phone numbers are only stored after explicit consent and are encrypted.







13\. Non-functional requirements



Availability: 99.5% for dashboard and API.

Scalability: initial target 10k scans/day with capacity to scale via stateless web servers + Redis + worker pool.

Localisation: Tamil + English; text assets and CTA customizable per merchant.

Response times: public landing page TTFB <500ms (CDN cache where possible).







**14. Implementation Suggestions \& Tech Stack (Updated)**

**Backend Platform**



Use Firebase as the main backend infrastructure.



**Components:**



**Database:**

Cloud Firestore

Stores merchants, feedback, coupons, and campaigns

NoSQL document structure

Real-time updates for dashboards



**Authentication:**

Firebase Authentication

Owner login

Admin login

OTP / email login supported



**Backend Logic:**

Firebase Cloud Functions

Process feedback submissions

Send owner alerts

Generate coupons

Trigger marketing campaigns



**Example Cloud Function triggers:**

onFeedbackSubmit()

generateCoupon()

sendOwnerAlert()

scheduleFestivalCampaign()



**Hosting**

Firebase Hosting

Landing page for QR scans

Admin dashboard frontend



**Notifications:**

Firebase Cloud Messaging

Send push alerts to merchant mobile app (future feature)



**Storage:**

Firebase Cloud Storage

Store QR assets

Store design templates

Campaign images





**15. Roadmap (recommended):**



(MVP): Merchant onboarding, QR generator, scan landing page, public/private flows, coupon engine, owner dashboard basic.

(MVP): WhatsApp Business integration, analytics, export, billing integration.

(MVP): Campaign automation, segmentation, templates, multi-merchant dashboard, branding customizations.

(MVP): Integrations marketplace (POS plugins), SLA upgrades, advanced analytics (cohort, LTV).







**16. Pricing \& packaging (example)**



Free tier: limited scans/month, basic dashboard, QR generation.

Starter: fixed monthly fee — up to X scans, WhatsApp alerts, coupon engine.

Pro: higher limits, campaign sends, priority support, white-label assets.

Add-ons: extra campaign credits, SMS fallback credits, custom onboarding.







**17. Operational playbook (owner)**



Daily: check feedback inbox and resolve negative threads within 24h.

Weekly: export feedback and review trends.

Campaigns: run festival campaigns to opt-in list with suppression of recent negative responders.





**18. Risks \& mitigations**



Risk: Merchants use coupon codes fraudulently. → Use single-use codes, POS verification, device/geo checks.

Risk: WhatsApp template approval delays. → Provide email/SMS fallback; queue templates ahead of major campaigns.

Risk: Customers bypass Google review redirect. → Show micro-copy explaining benefit and make CTA prominent; track click-through and surface follow-up nudges.







**19. Deliverables (for engineering)**



API spec (OpenAPI) and sample Flask blueprint.

QR generation service (PNG/SVG + printable template).

Landing page HTML/CSS/JS (mobile-first).

Feedback ingestion pipeline + worker for alert delivery.

Admin dashboard (merchant users) with analytics widgets.

Test plan (unit + integration + load test for 10k scans/day).

Privacy \& consent UI text and terms.





**20. Example minimal acceptance-test checklist**



Create merchant → verify QR links to correct landing page.

Submit 5★ rating → click-to-Google, coupon appears and is valid.

Submit 2★ rating → feedback arrives in owner inbox and WhatsApp alert delivered.

Redeem coupon via API → redemption recorded and cannot be reused.

Export CSV of feedback with timestamps and anonymized phone hashes
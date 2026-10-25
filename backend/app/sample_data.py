"""
Sample documents generator for RAG Knowledge Assistant.
Creates high-fidelity knowledge documents across diverse domains:
1. Transformer Neural Architectures
2. Cloud Native Microservices Architecture
3. Clinical Drug Trial Protocol
4. Financial Risk & Compliance (Basel III)
5. Zero Trust Cybersecurity Architecture
"""

from pathlib import Path

SAMPLE_PAPERS = {
    "transformer_neural_architecture.txt": {
        "title": "Attention Is All You Need — Transformer Architecture Deep Dive",
        "category": "AI & Deep Learning",
        "content": """ATTENTION IS ALL YOU NEED — SYSTEM SPECIFICATION & ARCHITECTURE
Published: Computer Vision and Pattern Recognition / NeurIPS
Lead Authors: Vaswani et al.

1. EXECUTIVE SUMMARY & MOTIVATION
The Transformer is the first sequence transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution. Recurrent models typically factor computation along the symbol positions of the input and output sequences, generating a sequence of hidden states h_t as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.

2. MODEL ARCHITECTURE & MULTI-HEAD ATTENTION
The Transformer follows an encoder-decoder architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.

2.1 Encoder Stack
The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers:
1. Multi-Head Self-Attention Mechanism
2. Position-wise Fully Connected Feed-Forward Network
We employ a residual connection around each of the two sub-layers, followed by layer normalization. That is, the output of each sub-layer is LayerNorm(x + Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer itself. To facilitate these residual connections, all sub-layers in the model, as well as the embedding layers, produce outputs of dimension d_model = 512.

2.2 Decoder Stack
The decoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking, combined with the fact that output embeddings are offset by one position, ensures that the predictions for position i can depend only on the known outputs at positions less than i.

2.3 Scaled Dot-Product Attention
An attention function can be described as mapping a query and a set of key-value pairs to an output. The queries and keys are of dimension d_k, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to obtain the weights on the values.
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V
We use the scaling factor 1 / sqrt(d_k) because for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions that have extremely small gradients.

2.4 Multi-Head Attention Mechanism
Instead of performing a single attention function with d_model-dimensional keys, values, and queries, we found it beneficial to linearly project the queries, keys, and values h times with different, learned linear projections to d_k, d_k, and d_v dimensions, respectively. In our work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64. Due to the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality.
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W_O
where head_i = Attention(Q * W_i^Q, K * W_i^K, V * W_i^V)

3. POSITIONAL ENCODINGS
Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add 'positional encodings' to the input embeddings at the bottoms of the encoder and decoder stacks. The positional encodings have the same dimension d_model as the embeddings, so that the two can be summed. In this work, we use sine and cosine functions of different frequencies:
PE(pos, 2i) = sin(pos / 10000^(2i / d_model))
PE(pos, 2i + 1) = cos(pos / 10000^(2i / d_model))
where pos is the position and i is the dimension.

4. TRAINING REGIME AND HYPERPARAMETERS
The base model was trained on 8 NVIDIA P100 GPUs for 100,000 steps (12 hours). We used the Adam optimizer with beta_1 = 0.9, beta_2 = 0.98, and epsilon = 10^-9. We varied the learning rate over the course of training according to the formula:
lrate = d_model^(-0.5) * min(step_num^(-0.5), step_num * warmup_steps^(-1.5))
with warmup_steps = 4000. We applied dropout to the sums of embeddings and positional encodings with P_drop = 0.1. On the WMT 2014 English-to-German translation task, the Transformer big model achieved a BLEU score of 28.4, outperforming the previous state of the art by more than 2.0 BLEU.
"""
    },

    "cloud_native_microservices.txt": {
        "title": "Cloud-Native Enterprise Microservices Architecture & Resilience Patterns",
        "category": "Cloud & Distributed Systems",
        "content": """CLOUD-NATIVE ENTERPRISE MICROSERVICES ARCHITECTURE GUIDE
Standard Operating Architecture: Production Grade v4.2

1. CORE TENETS OF CLOUD-NATIVE ARCHITECTURE
Modern enterprise platforms rely on containerized microservices orchestrated via Kubernetes (EKS/GKE). Services are autonomous, stateless, and communicate via gRPC for synchronous internal communication and Apache Kafka for asynchronous event-driven streaming.

2. SERVICE RESILIENCE & CIRCUIT BREAKER SPECIFICATION
Distributed systems must be designed for partial failure. Cascading failures are mitigated using the Circuit Breaker pattern (implemented via Resilience4j or Envoy proxy).
2.1 State Transitions
The Circuit Breaker operates in three states:
- CLOSED: Requests pass through normally. Failure rate is tracked within a rolling time window of 60 seconds.
- OPEN: When the failure rate exceeds 50% over a minimum sample size of 20 requests, the breaker trips to OPEN. All incoming requests immediately fail-fast with HTTP 503 (Service Unavailable) or trigger fallback degraded logic without invoking the downstream service.
- HALF-OPEN: After a sleep window of 30 seconds, the breaker enters HALF-OPEN state, permitting 5 trial requests. If all 5 succeed, the breaker resets to CLOSED. If any trial fails, it reverts to OPEN for an additional 60 seconds.

2.2 Retry Backoff with Jitter
Automated retries must apply exponential backoff with full jitter to prevent thundering herd spikes:
Wait_Interval = Min(Max_Backoff, Base_Backoff * 2^Attempt) + Uniform_Random(0, Jitter_Max)
Default configuration: Base_Backoff = 200ms, Max_Backoff = 3000ms, Max_Retries = 3.

3. DATA CONSISTENCY: SAGA PATTERN
Because microservices maintain private databases (Database-per-Service pattern), distributed 2-Phase Commit (2PC) is rejected due to locking bottlenecks. Instead, long-running business transactions use Orchestrated Sagas.
- Saga Orchestrator: An event coordinator (built on Temporal or Kafka) emits command events.
- Compensating Transactions: If order payment succeeds but inventory reservation fails, the orchestrator issues a Compensating Transaction (e.g., RefundPaymentCommand) to ensure eventual consistency.
- Idempotency Keys: All endpoints consuming saga commands require a UUID idempotency key cached in Redis for 24 hours to prevent duplicate processing.

4. OBSERVABILITY & DISTRIBUTED TRACING
Full observability is mandated across three telemetry pillars:
- Metrics: Prometheus scrapes OpenMetrics endpoints every 15s. Key Golden Signals: Latency (p50, p95, p99), Traffic (RPS), Errors (5xx rate), and Saturation (CPU/Memory).
- Tracing: Distributed context propagation via W3C TraceContext headers (traceparent and tracestate) instrumented using OpenTelemetry SDKs, sent to Jaeger/Tempo.
- Logging: Structured JSON logs including service_name, environment, trace_id, and span_id.
"""
    },

    "clinical_drug_trial_protocol.txt": {
        "title": "Clinical Trial Protocol: Phase III Investigational Biologic RX-849",
        "category": "Healthcare & Pharmaceuticals",
        "content": """INVESTIGATIONAL BIOLOGIC CLINICAL PROTOCOL: RX-849
Protocol Identifier: MED-RX849-PH3-2026
Sponsor: Global Biopharma Research Consortium

1. OBJECTIVES AND HYPOTHESIS
The primary objective of this randomized, double-blind, placebo-controlled Phase III study is to evaluate the therapeutic efficacy and safety profile of RX-849 (a recombinant human monoclonal antibody targeting Interleukin-33) in adult patients with moderate-to-severe uncontrolled pulmonary disease.
The clinical hypothesis states that subcutaneous administration of RX-849 (300 mg every 2 weeks) will achieve a statistically significant reduction in annualized exacerbation rates compared to placebo over a 52-week evaluation period.

2. PATIENT ELIGIBILITY CRITERIA
2.1 Inclusion Criteria
- Age between 18 and 75 years at time of screening consent.
- Documented clinical diagnosis of persistent pulmonary inflammation for >= 12 months.
- Baseline Pre-bronchodilator FEV1 (Forced Expiratory Volume in 1 second) between 40% and 80% of predicted normal value.
- Documented history of >= 2 documented acute exacerbations requiring systemic corticosteroid bursts within the prior 12 months.
2.2 Exclusion Criteria
- Concurrent diagnosis of active tuberculosis, cystic fibrosis, or end-stage malignancy.
- Significant cardiovascular instability (NYHA Class III or IV congestive heart failure).
- Receipt of any investigational biologic within 6 months or 5 half-lives prior to Day 1 baseline.
- Pregnancy, lactation, or unwillingness to maintain dual barrier contraception.

3. DOSING, ADMINISTRATION, AND PHARMACOKINETICS
Patients are randomized 1:1 using stratified block randomization:
- Arm A (Active): RX-849 300 mg prefilled autoinjector administered subcutaneously every 14 days (Q2W).
- Arm B (Control): Matching volume-identical saline placebo autoinjector administered subcutaneously Q2W.
Pharmacokinetic parameters: Peak serum concentration (C_max) is achieved at median T_max of 72 hours post-dose. The elimination terminal half-life (t_1/2) is 24.3 days, exhibiting non-linear target-mediated drug disposition at sub-therapeutic concentrations.

4. ENDPOINTS AND STATISTICAL ANALYSIS PLAN
4.1 Primary Endpoint
The primary endpoint is the Annualized Exacerbation Rate (AER) over 52 weeks, analyzed via negative binomial regression models with log-link function, adjusted for baseline eosinophil counts and geographic region. Alpha level is set at two-sided 0.05.
4.2 Secondary Endpoints
- Mean change from baseline in pre-bronchodilator FEV1 at Week 24 and Week 52.
- Proportion of patients achieving >= 0.5 point improvement in SGRQ (St. George's Respiratory Questionnaire) quality-of-life score.
- Time to first severe exacerbation leading to hospitalization.

5. SAFETY MONITORING AND ADVERSE EVENT REPORTING
An independent Data and Safety Monitoring Board (DSMB) conducts quarterly unblinded safety reviews. Serious Adverse Events (SAEs) must be reported to the study sponsor and regulatory authorities within 24 hours of site discovery. Immediate treatment cessation is mandated for any Grade 4 anaphylactic reaction or drug-induced liver injury (ALT/AST > 5x Upper Limit of Normal with bilirubin > 2x ULN).
"""
    },

    "financial_risk_compliance.txt": {
        "title": "Basel III Capital Accord, Liquidity Risk & AML Compliance Framework",
        "category": "Banking & Financial Regulation",
        "content": """GLOBAL BANKING REGULATORY COMPLIANCE FRAMEWORK: BASEL III & AML
Regulatory Reference Manual: Fin-Reg-2026-B3

1. BASEL III CAPITAL ADEQUACY REQUIREMENTS
The Basel III framework strengthens global bank capital and liquidity standards to absorb financial and economic stress.
1.1 Minimum Capital Ratios
Banks must maintain regulatory capital against Risk-Weighted Assets (RWA):
- Common Equity Tier 1 (CET1): Minimum 4.5% of RWA at all times.
- Tier 1 Capital: Minimum 6.0% of RWA.
- Total Capital (Tier 1 + Tier 2): Minimum 8.0% of RWA.
1.2 Capital Buffers
- Capital Conservation Buffer (CCB): An additional 2.5% CET1 buffer, raising the effective CET1 target to 7.0%. Breach of the CCB restricts discretionary bonus distributions and share buybacks.
- Countercyclical Capital Buffer (CCyB): Ranges from 0% to 2.5% of RWA, activated during periods of excessive credit growth to build reserves for cyclical downturns.
1.3 Leverage Ratio
To constrain excessive leverage, Basel III introduces a non-risk-weighted Leverage Ratio:
Leverage Ratio = Tier 1 Capital / Total Exposure Measure >= 3.0% (5.0% for Global Systemically Important Banks - G-SIBs).

2. LIQUIDITY RISK METRICS: LCR AND NSFR
2.1 Liquidity Coverage Ratio (LCR)
The LCR ensures financial institutions maintain an adequate buffer of unencumbered High-Quality Liquid Assets (HQLA) that can be converted to cash to withstand a 30-day acute liquidity stress scenario:
LCR = (Total Stock of HQLA) / (Total Net Cash Outflows over 30 Days) >= 100%
HQLA is categorized into Level 1 (cash, central bank reserves, sovereign bonds with 0% haircut) and Level 2 (qualified corporate bonds with 15% to 50% haircuts).
2.2 Net Stable Funding Ratio (NSFR)
The NSFR requires banks to maintain a stable funding profile in relation to their off-balance sheet and on-balance sheet assets over an extended 1-year time horizon:
NSFR = (Available Stable Funding - ASF) / (Required Stable Funding - RSF) >= 100%

3. VALUE AT RISK (VAR) AND STRESS TESTING
Market risk is calculated using a 99% confidence level Value at Risk (VaR) over a 10-day holding period using historical simulation over at least 250 trading days. Banks must also compute Stressed VaR (sVaR) calibrated to continuous 12-month periods of severe financial stress (such as the 2008 Lehman collapse).

4. ANTI-MONEY LAUNDERING (AML) & SANCTIONS ENFORCEMENT
All transactions exceeding $10,000 USD (or equivalent foreign currency) trigger mandatory Currency Transaction Reporting (CTR) within 15 calendar days.
Customer Due Diligence (CDD) mandates Ultimate Beneficial Owner (UBO) identification for any individual owning >= 25% equity interest in a corporate entity. Suspicious Activity Reports (SARs) must be filed with FinCEN within 30 days of detection when suspicious velocity, layering, or structuring patterns emerge.
"""
    },

    "cybersecurity_zero_trust.txt": {
        "title": "Zero Trust Enterprise Cybersecurity Architecture (NIST SP 800-207)",
        "category": "Cybersecurity & InfoSec",
        "content": """NIST SP 800-207 ZERO TRUST ENTERPRISE ARCHITECTURE STANDARD
Operational Security Directive: SEC-ZTA-2026

1. PHILOSOPHICAL FOUNDATIONS OF ZERO TRUST
Traditional perimeter-based network security ('castle-and-moat') assumes that actors inside the corporate intranet are inherently trusted. The Zero Trust Architecture (ZTA) fundamentally inverts this model:
- 'Never Trust, Always Verify': Explicit verification is required for every access request, irrespective of whether the request originates from within the internal subnet or the public internet.
- Assume Breach: Architecture assumes adversaries exist inside internal network segments and assets may already be compromised.
- Least Privilege Access: Users, microservices, and devices receive only the absolute minimum permissions necessary to execute immediate job duties (Just-in-Time, Just-Enough-Access).

2. CORE COMPONENTS OF ZERO TRUST ARCHITECTURE
A standard NIST SP 800-207 deployment consists of:
2.1 Policy Decision Point (PDP)
The PDP evaluates contextual signals (device posture, user behavioral baseline, geographic IP velocity, time of day, MFA status) and issues authorization decisions. The PDP consists of:
- Policy Engine (PE): Responsible for the ultimate access decision utilizing enterprise security policies.
- Policy Administrator (PA): Communicates with the Policy Enforcement Point to establish or terminate authenticated communication channels.
2.2 Policy Enforcement Point (PEP)
The PEP sits directly in the data plane between the client subject and the protected enterprise resource. It intercepts, decrypts, inspects, and permits or denies traffic based strictly on instructions from the PDP. All connections utilize Mutual TLS (mTLS) with ephemeral X.509 certificates rotated every 24 hours.

3. MICROSEGMENTATION & SOFTWARE-DEFINED PERIMETER (SDP)
Networks are partitioned into discrete granular micro-perimeters using overlay networks (e.g., WireGuard, Cilium eBPF, or AWS Security Groups). Lateral movement is eliminated by denying all default east-west traffic between internal servers. A database server will accept inbound traffic only from explicitly authorized application containers on designated TCP ports.

4. IDENTITY AND ACCESS MANAGEMENT (IAM) & PHISHING-RESISTANT MFA
Passwords alone are strictly prohibited. Identity verification mandates FIDO2/WebAuthn hardware tokens (e.g., YubiKey) or biometric passkeys providing cryptographic proof against adversary-in-the-middle (AiTM) phishing attacks. Session tokens expire after 8 hours of inactivity and enforce continuous re-authentication when anomalous risk telemetry (such as impossible travel velocity or disabled endpoint EDR) is detected.

5. SIEM AND AUTOMATED SOAR RESPONSE
Security events are aggregated in real-time into centralized Security Information and Event Management (SIEM) systems. Automated Security Orchestration, Automation, and Response (SOAR) playbooks automatically isolate compromised endpoints, revoke active OAuth refresh tokens, and snapshot memory within 45 seconds of detecting ransomware indicators of compromise (IoCs).
"""
    }
}


def populate_sample_documents(samples_dir: Path):
    """Writes preloaded sample documents to disk if not already present."""
    samples_dir.mkdir(parents=True, exist_ok=True)
    for filename, item in SAMPLE_PAPERS.items():
        filepath = samples_dir / filename
        if not filepath.exists():
            filepath.write_text(item["content"], encoding="utf-8")
    return list(SAMPLE_PAPERS.keys())

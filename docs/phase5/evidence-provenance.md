# AbhedyaX Evidence Provenance & Zero-Payload Guarantee

## 1. Overview
In cyber-defense auditing, an analyst or regulatory body cannot blindly trust an assessment score without verifying the provenance of each data point. AbhedyaX implements an auditable **Evidence Provenance Framework** where every protocol observation, cryptographic transform, and behavioral classification carries an unbroken lineage back to raw wire packets or controlled ground-truth environments.

---

## 2. Provenance Taxonomy

Every parameter evaluated in the canonical `AnalysisResult` is tagged with one of five standardized provenance classifications:

| Source Type | Icon / Visual Badge | Confidence | Extraction Mechanism | Example Parameter |
| :--- | :--- | :---: | :--- | :--- |
| **`Observed`** | Cyan / Eye | 100% | Direct wire dissection from cleartext IKE handshake headers (UDP 500/4500) or outer IP/ESP headers. | `vpn.ike_version = "IKEv2"`, `esp.spi = "0x89ab12cd"` |
| **`Inferred`** | Purple / CPU | 95–99% | Derived through cryptographic deduction rules (e.g. AEAD mode implies implicit ICV integrity). | `cryptography.authentication = "AEAD (Built-in)"` |
| **`Simulated`** | Amber / TestTube | 100% | Injected by deterministic RFC testbed benchmark profiles for synthetic analysis. | `vpn.ike_version = "IKEv2"`, `pfs = True` |
| **`GroundTruth`**| Emerald / CheckCircle | 100% | Validated against strongSwan kernel configuration in the isolated Linux testbed. | `scenario = "strongswan-enterprise-rfc7296"` |
| **`MLPrediction`**| Sky / Sparkles | 55–99% | Inferred by Random Forest classifier using 28 statistical flow metadata features without payload inspection. | `traffic.predicted_class = "Video"` |

---

## 3. Zero-Payload Inspection Guarantee

### What AbhedyaX NEVER Does:
1. **Never Decrypts ESP Payloads:** Encapsulating Security Payload packets (IP protocol 50) remain encrypted as ciphertext throughout the entire ingestion and classification lifecycle.
2. **Never Ingests Private Keys:** AbhedyaX does not require, accept, or process private keys, shared secrets, or certificates.
3. **Never Logs Application Content:** User credentials, HTTP bodies, DNS queries, and media payloads are never parsed or persisted.

### What AbhedyaX Dissects:
1. **Unencrypted IKE Handshake Messages:**
   - IKE_SA_INIT and IKE_AUTH transform proposals (Encryption Transform ID, PRF Transform ID, Integrity Transform ID, Diffie-Hellman Group ID).
   - Exchange type (IKEv1 Main/Aggressive vs. IKEv2 Request/Response).
   - Nonce and Key Exchange payload presence (confirming PFS).
2. **ESP Outer Headers:**
   - Security Parameters Index (SPI) from outer ESP header (32-bit identifier).
   - Sequence Numbers for anti-replay verification.
   - Packet inter-arrival times ($\Delta t$), frame lengths, and burst cadences.

---

## 4. Canonical Pydantic Schema

In `app/models/analysis.py` and `apps/web/src/types/analysis.ts`:

```python
class EvidenceProvenanceItem(BaseModel):
    """Auditable evidence tracking item for a single evaluated security parameter."""
    id: str = Field(..., description="Unique provenance reference (e.g. PROV-001)")
    source_type: Literal["Observed", "Inferred", "Simulated", "GroundTruth", "MLPrediction"]
    field: str = Field(..., description="Dot-notated result field path")
    value: str = Field(..., description="Extracted parameter value")
    packet_ref: Optional[str] = Field(None, description="Wire packet index or frame reference")
    description: str = Field(..., description="Clear explanation of how parameter was captured")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
```

---

## 5. UI Integration
- **`EvidenceBadge.tsx`:** Renders color-coded provenance pills with icons and confidence percentages.
- **`AssessmentProvenance.tsx`:** Comprehensive provenance table rendered on the Analysis Overview and Technical Report tabs.
- **`FindingCard.tsx` & `FindingDetailPanel.tsx`:** Displays the provenance of each finding directly alongside its severity.

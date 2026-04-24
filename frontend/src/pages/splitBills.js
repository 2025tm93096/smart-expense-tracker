import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TopBar from "../components/TopBar";
import getSplitBillsStyles from "../styles/splitBillsStyles";
import useWindowWidth from "../hooks/useWindowWidth";

const MAX_MEMBERS = 20;

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+81", label: "🇯🇵 +81" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+86", label: "🇨🇳 +86" },
];

function SplitBills() {
  const { isDark } = useTheme();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const s = getSplitBillsStyles(isDark, isMobile);

  // form state
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [members, setMembers] = useState([
    { name: "", countryCode: "+91", mobile: "" },
  ]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addSelf, setAddSelf] = useState(false);
  const [myProfile, setMyProfile] = useState(null);

  // splits list
  const [splits, setSplits] = useState([]);
  const [incomingSplits, setIncomingSplits] = useState([]);
  const [myMobile, setMyMobile] = useState("");
  const [loadingSplits, setLoadingSplits] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/splits"),
      API.get("/splits/incoming"),
      API.get("/me"),
    ])
      .then(([splitsRes, incomingRes, meRes]) => {
        setSplits(splitsRes.data);
        setIncomingSplits(incomingRes.data);
        setMyMobile(meRes.data.mobile || "");
        setMyProfile(meRes.data);
      })
      .catch(() => {})
      .finally(() => setLoadingSplits(false));
  }, []);

  // ── member helpers ───────────────────────────────────────
  const updateMember = (idx, field, value) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((prev) => [
      ...prev,
      { name: "", countryCode: "+91", mobile: "" },
    ]);
  };

  const removeMember = (idx) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalMemberCount = members.length + (addSelf ? 1 : 0);
  const perHead =
    totalAmount && totalMemberCount
      ? (parseFloat(totalAmount) / totalMemberCount).toFixed(2)
      : null;

  // ── submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const clean = members.map((m) => ({
      name: m.name.trim(),
      mobile: `${m.countryCode}${m.mobile.trim()}`,
    }));

    // Prepend self if checked — mark as settled since creator needs no payment
    if (addSelf && myProfile?.mobile) {
      clean.unshift({
        name: myProfile.username,
        mobile: myProfile.mobile,
        settled: true,
      });
    }

    if (clean.some((m) => !m.name || !m.mobile)) {
      setFormError("All members must have a name and mobile number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post("/splits", {
        description,
        note,
        totalAmount: parseFloat(totalAmount),
        members: clean,
      });
      setSplits((prev) => [res.data, ...prev]);
      setDescription("");
      setNote("");
      setTotalAmount("");
      setMembers([{ name: "", mobile: "" }]);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create split");
    } finally {
      setSubmitting(false);
    }
  };

  // ── settle toggle ────────────────────────────────────────
  const handleSettle = async (splitId, memberId) => {
    try {
      const res = await API.patch(`/splits/${splitId}/settle/${memberId}`);
      setSplits((prev) =>
        prev.map((sp) => (sp._id === splitId ? res.data : sp)),
      );
    } catch {
      // silent
    }
  };

  // ── pay (self-settle) ──────────────────────────────────────
  const handlePay = async (splitId) => {
    try {
      const res = await API.patch(`/splits/${splitId}/pay`);
      setIncomingSplits((prev) =>
        prev.map((sp) => (sp._id === splitId ? res.data : sp)),
      );
    } catch {
      // silent
    }
  };

  // ── delete split ─────────────────────────────────────────
  const handleDelete = async (splitId) => {
    try {
      await API.delete(`/splits/${splitId}`);
      setSplits((prev) => prev.filter((sp) => sp._id !== splitId));
    } catch {
      // silent
    }
  };

  return (
    <div style={s.page} className="sb-page">
      <div style={s.header} className="sb-header">
        <h2 style={s.title} className="sb-title">
          🔀 Split Bills
        </h2>
        <div
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
          className="sb-header-right"
        >
          <Link to="/dashboard" style={s.backBtn}>
            ← Back to Dashboard
          </Link>
          <TopBar />
        </div>
      </div>

      <div style={s.grid} className="sb-grid">
        {/* ── Create Split Form ── */}
        <div>
          <div style={s.card} className="sb-card">
            <div style={s.cardTitle}>Create New Split</div>

            {formError && (
              <div
                style={{
                  background: isDark ? "#3d1a1a" : "#fff0f0",
                  color: isDark ? "#fc8181" : "#e53e3e",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label style={s.label} htmlFor="description">
                Description
              </label>
              <input
                id="description"
                style={s.input}
                type="text"
                placeholder="e.g. Dinner at Pizza Place"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={100}
                required
              />

              <label style={s.label} htmlFor="note">
                Note{" "}
                <span
                  style={{
                    fontWeight: 400,
                    color: isDark ? "#6060a0" : "#aaa",
                  }}
                >
                  (optional)
                </span>
              </label>
              <textarea
                id="note"
                style={{
                  ...s.input,
                  resize: "vertical",
                  minHeight: "60px",
                  fontFamily: "inherit",
                }}
                placeholder="Additional details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
              />

              <label style={s.label} htmlFor="totalAmount">
                Total Amount (₹)
                {perHead && (
                  <span style={s.perHeadBadge}>₹{perHead} / person</span>
                )}
              </label>
              <input
                id="totalAmount"
                style={s.input}
                type="number"
                placeholder="Enter total bill amount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />

              <div style={s.label}>
                Members
                <span style={{ marginLeft: "8px", ...s.perHeadBadge }}>
                  {members.length + (addSelf ? 1 : 0)}/{MAX_MEMBERS}
                </span>
              </div>
              <div style={s.memberCount}>
                Amount split equally among all members
              </div>

              {/* Add me to split checkbox */}
              <label style={s.checkRow}>
                <input
                  type="checkbox"
                  checked={addSelf}
                  onChange={(e) => setAddSelf(e.target.checked)}
                  style={{
                    accentColor: "#667eea",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                <span>Add me to this split</span>
                {addSelf && myProfile && (
                  <span style={s.selfBadge}>{myProfile.username}</span>
                )}
              </label>

              {members.map((m, idx) => (
                <div key={idx} style={s.memberRow} className="sb-member-row">
                  <input
                    style={s.memberInput}
                    type="text"
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                    maxLength={50}
                    required
                  />
                  <select
                    style={s.memberCountrySelect}
                    value={m.countryCode}
                    onChange={(e) =>
                      updateMember(idx, "countryCode", e.target.value)
                    }
                    aria-label="Country code"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    style={s.memberInput}
                    type="tel"
                    placeholder="Mobile"
                    value={m.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 12) updateMember(idx, "mobile", val);
                    }}
                    maxLength={12}
                    required
                  />
                  <button
                    type="button"
                    style={s.removeBtn}
                    onClick={() => removeMember(idx)}
                    disabled={members.length === 1}
                    title="Remove member"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {members.length < MAX_MEMBERS && (
                <button
                  type="button"
                  style={s.addMemberBtn}
                  onClick={addMember}
                >
                  + Add Member
                </button>
              )}

              <button
                type="submit"
                style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Split Bill"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Incoming Requests + Splits List ── */}
        <div>
          {/* Incoming split requests for current user */}
          {incomingSplits.length > 0 && (
            <div style={s.incomingSection}>
              <div style={s.cardTitle}>
                🔔 Requests for You ({incomingSplits.length})
              </div>
              {incomingSplits.map((split) => {
                const myMember = split.members.find(
                  (m) => m.mobile === myMobile,
                );
                const isPaid = myMember?.settled ?? false;
                return (
                  <div
                    key={split._id}
                    style={s.incomingItem}
                    className="sb-incoming-item"
                  >
                    <div style={s.incomingLeft}>
                      <div style={s.splitDesc}>{split.description}</div>
                      {split.note && (
                        <div style={s.splitNote}>{split.note}</div>
                      )}
                      <div style={s.splitDate}></div>
                    </div>
                    <div style={s.incomingRight} className="sb-incoming-right">
                      <div style={s.incomingShare}>
                        ₹{myMember?.share?.toLocaleString("en-IN") ?? "—"}
                      </div>
                      <button
                        style={s.payBtn(isPaid)}
                        onClick={() => !isPaid && handlePay(split._id)}
                        disabled={isPaid}
                      >
                        {isPaid ? "✓ Paid" : "Pay Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ ...s.cardTitle, marginBottom: "16px" }}>
            Your Splits ({splits.length})
          </div>

          {loadingSplits ? (
            <div style={s.emptyText}>Loading...</div>
          ) : splits.length === 0 ? (
            <div style={s.emptyText}>
              No splits yet. Create your first split!
            </div>
          ) : (
            splits.map((split) => {
              const settled = split.members.filter((m) => m.settled).length;
              const total = split.members.length;
              return (
                <div key={split._id} style={s.splitCard}>
                  <div style={s.splitHeader}>
                    <div>
                      <div style={s.splitDesc}>{split.description}</div>
                      {split.note && (
                        <div style={s.splitNote}>{split.note}</div>
                      )}
                      <div style={s.splitDate}>
                        {new Date(split.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {"  ·  "}
                        {settled}/{total} settled
                      </div>
                    </div>
                    <div style={s.splitAmount}>
                      ₹{split.totalAmount.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <ul style={s.memberList}>
                    {split.members.map((m) => (
                      <li key={m._id} style={s.memberItem}>
                        <div style={s.memberInfo}>
                          <span style={s.memberName}>{m.name}</span>
                          <span style={s.memberMobile}>{m.mobile}</span>
                        </div>
                        <div style={s.memberRight}>
                          <span style={s.memberShare}>
                            ₹{m.share.toLocaleString("en-IN")}
                          </span>
                          <button
                            style={s.settleBtn(m.settled)}
                            onClick={() => handleSettle(split._id, m._id)}
                          >
                            {m.settled ? "✓ Settled" : "Pending"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {settled === 0 && (
                    <button
                      style={s.deleteBtn}
                      onClick={() => handleDelete(split._id)}
                    >
                      Delete Split
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default SplitBills;

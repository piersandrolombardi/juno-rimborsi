import React, { useState, useEffect, useRef } from "react";

// --- MOCK DATA ---
const USERS = {
  "mario.rossi": { password: "juno2024", role: "client", id: "ASS-20198", name: "Mario Rossi", email: "mario.rossi@email.it", cf: "RSSMRA75D15H501Z", phone: "+39 345 678 9012", address: "Via Roma 42, 20121 Milano", policy: "SAL-PLUS-2024", policyType: "Salute Plus", validFrom: "01/01/2024", validTo: "31/12/2025", iban: "IT60 X054 2811 1010 0000 0123 456", bank: "Banca Intesa Sanpaolo", familyMembers: [
    { name: "Laura Rossi", relation: "Coniuge", cf: "RSSLRA78M45F205W", dob: "05/08/1978" },
    { name: "Sofia Rossi", relation: "Figlia", cf: "RSSSFO10A41F205X", dob: "01/01/2010" }
  ]},
  "anna.bianchi": { password: "juno2024", role: "client", id: "ASS-20245", name: "Anna Bianchi", email: "anna.bianchi@email.it", cf: "BNCNNA80B50F205Y", phone: "+39 333 456 7890", address: "Corso Vittorio Emanuele 18, 10121 Torino", policy: "SAL-BASE-2024", policyType: "Salute Base", validFrom: "01/03/2024", validTo: "28/02/2026", iban: "IT40 S030 6909 6061 0000 0075 849", bank: "Banca Mediolanum", familyMembers: [] },
  "op.giulia": { password: "juno2024", role: "backoffice", id: "OP-001", name: "Giulia Ferretti", email: "g.ferretti@juno-assicurazioni.it", position: "Operatrice Back-Office Senior" },
  "op.luca": { password: "juno2024", role: "backoffice", id: "OP-002", name: "Luca Marchetti", email: "l.marchetti@juno-assicurazioni.it", position: "Responsabile Liquidazioni" }
};

const INITIAL_CLAIMS = [
  { id: "ROL-2024-0012", date: "15/01/2025", userId: "mario.rossi", beneficiary: "Mario Rossi", type: "Visita specialistica", status: "rimborsata", amount: 150, reimbursed: 120, docs: ["Prescrizione medica", "Fattura"], notes: "Rimborso completato il 28/01/2025", assignedTo: "op.giulia", history: [
    { date: "15/01/2025 09:30", action: "Pratica creata", by: "Mario Rossi" },
    { date: "15/01/2025 14:15", action: "Presa in carico", by: "Giulia Ferretti" },
    { date: "22/01/2025 10:00", action: "Verifica completata — importo approvato €120,00", by: "Giulia Ferretti" },
    { date: "28/01/2025 16:45", action: "Rimborso erogato su IBAN IT60 X054...", by: "Sistema" }
  ]},
  { id: "ROL-2024-0034", date: "03/02/2025", userId: "mario.rossi", beneficiary: "Laura Rossi", type: "Esami di laboratorio", status: "in_elaborazione", amount: 280, reimbursed: null, docs: ["Prescrizione medica", "Fattura 1", "Fattura 2"], notes: "In fase di verifica documentale", assignedTo: "op.giulia", history: [
    { date: "03/02/2025 11:20", action: "Pratica creata", by: "Mario Rossi" },
    { date: "04/02/2025 09:00", action: "Presa in carico", by: "Giulia Ferretti" }
  ]},
  { id: "ROL-2024-0041", date: "18/02/2025", userId: "mario.rossi", beneficiary: "Sofia Rossi", type: "Visita pediatrica", status: "da_integrare", amount: 90, reimbursed: null, docs: ["Fattura"], notes: "Manca la prescrizione medica del pediatra", missing: ["Prescrizione medica"], assignedTo: "op.luca", history: [
    { date: "18/02/2025 16:00", action: "Pratica creata", by: "Mario Rossi" },
    { date: "19/02/2025 10:30", action: "Presa in carico", by: "Luca Marchetti" },
    { date: "19/02/2025 11:00", action: "Richiesta integrazione: prescrizione medica", by: "Luca Marchetti" }
  ]},
  { id: "ROL-2024-0055", date: "05/03/2025", userId: "mario.rossi", beneficiary: "Mario Rossi", type: "Fisioterapia", status: "respinta", amount: 450, reimbursed: 0, docs: ["Prescrizione medica", "Fattura"], notes: "Prestazione non coperta dal piano Salute Plus", assignedTo: "op.luca", history: [
    { date: "05/03/2025 08:45", action: "Pratica creata", by: "Mario Rossi" },
    { date: "06/03/2025 09:15", action: "Presa in carico", by: "Luca Marchetti" },
    { date: "10/03/2025 14:30", action: "Pratica respinta — motivo: prestazione esclusa dalla copertura", by: "Luca Marchetti" }
  ]},
  { id: "ROL-2024-0060", date: "12/03/2025", userId: "mario.rossi", beneficiary: "Mario Rossi", type: "Odontoiatria", status: "bozza", amount: null, reimbursed: null, docs: [], notes: "Pratica in fase di compilazione", history: [
    { date: "12/03/2025 20:10", action: "Bozza creata", by: "Mario Rossi" }
  ]},
  { id: "ROL-2024-0063", date: "14/03/2025", userId: "anna.bianchi", beneficiary: "Anna Bianchi", type: "Diagnostica per immagini", status: "in_elaborazione", amount: 320, reimbursed: null, docs: ["Prescrizione medica", "Fattura"], notes: "RMN ginocchio sinistro", assignedTo: "op.giulia", history: [
    { date: "14/03/2025 10:00", action: "Pratica creata", by: "Anna Bianchi" },
    { date: "15/03/2025 08:30", action: "Presa in carico", by: "Giulia Ferretti" }
  ]},
  { id: "ROL-2024-0065", date: "17/03/2025", userId: "anna.bianchi", beneficiary: "Anna Bianchi", type: "Visita specialistica", status: "da_integrare", amount: 180, reimbursed: null, docs: ["Prescrizione medica"], notes: "Manca fattura dello specialista", missing: ["Fattura"], assignedTo: null, history: [
    { date: "17/03/2025 15:20", action: "Pratica creata", by: "Anna Bianchi" },
    { date: "18/03/2025 09:00", action: "Richiesta automatica integrazione: fattura mancante", by: "Sistema" }
  ]}
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, userId: "mario.rossi", date: "19/02/2025", title: "Integrazione richiesta", message: "La pratica ROL-2024-0041 richiede l'integrazione della prescrizione medica per Sofia Rossi.", claimId: "ROL-2024-0041", read: false, type: "warning" },
  { id: 2, userId: "mario.rossi", date: "28/01/2025", title: "Rimborso erogato", message: "Il rimborso di €120,00 per la pratica ROL-2024-0012 è stato accreditato sul vostro IBAN.", claimId: "ROL-2024-0012", read: true, type: "success" },
  { id: 3, userId: "mario.rossi", date: "10/03/2025", title: "Pratica respinta", message: "La pratica ROL-2024-0055 (Fisioterapia) è stata respinta. Prestazione non coperta dal piano.", claimId: "ROL-2024-0055", read: false, type: "error" },
  { id: 4, userId: "anna.bianchi", date: "18/03/2025", title: "Integrazione richiesta", message: "La pratica ROL-2024-0065 necessita della fattura dello specialista.", claimId: "ROL-2024-0065", read: false, type: "warning" }
];

const STATUS_CONFIG = {
  bozza: { label: "Bozza", color: "#6B7280", bg: "#F3F4F6", icon: "✏️" },
  in_elaborazione: { label: "In elaborazione", color: "#D97706", bg: "#FEF3C7", icon: "⏳" },
  da_integrare: { label: "Da integrare", color: "#DC2626", bg: "#FEE2E2", icon: "⚠️" },
  rimborsata: { label: "Rimborsata", color: "#059669", bg: "#D1FAE5", icon: "✅" },
  respinta: { label: "Respinta", color: "#7C3AED", bg: "#EDE9FE", icon: "❌" }
};

const CARE_TYPES = ["Visita specialistica", "Esami di laboratorio", "Ricovero ospedaliero", "Fisioterapia", "Odontoiatria", "Visita pediatrica", "Diagnostica per immagini", "Intervento chirurgico", "Cure termali", "Altro"];

// --- SHARED COMPONENTS ---
const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status];
  return <span style={{ background: c.bg, color: c.color, padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{c.icon} {c.label}</span>;
};

const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)", padding: 24, ...style, cursor: onClick ? "pointer" : "default" }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "primary", disabled, style }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)", color: "#fff" },
    secondary: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" },
    danger: { background: "#fee2e2", color: "#dc2626" },
    success: { background: "#d1fae5", color: "#059669" },
    warning: { background: "#fef3c7", color: "#92400e" }
  };
  return <button disabled={disabled} onClick={onClick} style={{ padding: "10px 20px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all 0.2s", ...styles[variant], ...style }}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder, required, disabled }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>{label} {required && <span style={{ color: "#dc2626" }}>*</span>}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", background: disabled ? "#f8fafc" : "#fff" }} />
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>{label} {required && <span style={{ color: "#dc2626" }}>*</span>}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", background: "#fff" }}>
      <option value="">Seleziona...</option>
      {options.map(o => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ children, onClose, title, subtitle, width = 700 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
    <div style={{ background: "#fff", borderRadius: 20, width: "90%", maxWidth: width, maxHeight: "90vh", overflow: "auto" }}>
      <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", borderRadius: "20px 20px 0 0", zIndex: 2 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>{title}</h2>
          {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94a3b8" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// --- LOGIN ---
const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState("mario.rossi");
  const [pass, setPass] = useState("juno2024");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const u = USERS[user];
      if (u && u.password === pass) { onLogin(user); }
      else { setErr("Credenziali non valide"); setLoading(false); }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f2439 0%, #1e3a5f 40%, #2d5a8e 100%)" }}>
      <div style={{ width: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: 0 }}>JUNO</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "4px 0 0" }}>Portale Rimborsi Assicurativi</p>
        </div>
        <Card>
          <h2 style={{ margin: "0 0 24px", fontSize: 18, color: "#1e293b" }}>Accedi al tuo account</h2>
          <Input label="Nome utente" value={user} onChange={v => { setUser(v); setErr(""); }} placeholder="nome.cognome" />
          <Input label="Password" value={pass} onChange={v => { setPass(v); setErr(""); }} type="password" />
          {err && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>⚠️ {err}</p>}
          <Btn onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "12px", marginTop: 8 }}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </Btn>
          <div style={{ marginTop: 20, padding: 16, background: "#f8fafc", borderRadius: 10, fontSize: 12, color: "#64748b" }}>
            <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#475569" }}>Account demo:</p>
            <p style={{ margin: "2px 0" }}>👤 Cliente: <code>mario.rossi</code> / <code>juno2024</code></p>
            <p style={{ margin: "2px 0" }}>👤 Cliente: <code>anna.bianchi</code> / <code>juno2024</code></p>
            <p style={{ margin: "2px 0" }}>🏢 Back-office: <code>op.giulia</code> / <code>juno2024</code></p>
            <p style={{ margin: "2px 0" }}>🏢 Back-office: <code>op.luca</code> / <code>juno2024</code></p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- OCR SIMULATION ---
const simulateOCR = (fileType) => {
  if (fileType === "prescrizione") {
    return new Promise(r => setTimeout(() => r({
      success: true, type: "prescrizione",
      data: { doctor: "Dott. Marco Verdi", specialty: "Ortopedia", date: "10/03/2025", patient: "Mario Rossi", diagnosis: "Lombalgia cronica", prescribedCare: "Ciclo di 10 sedute di fisioterapia riabilitativa", urgency: "Ordinaria", ssn: "RSSMRA75D15H501Z" }
    }), 2000));
  }
  const amt = (Math.random() * 300 + 50).toFixed(2);
  return new Promise(r => setTimeout(() => r({
    success: true, type: "fattura",
    data: { provider: "Studio Medico Associato Salus S.r.l.", vat: "IT 0312345678", invoiceNo: `FT-2025/${Math.floor(Math.random() * 9000 + 1000)}`, date: "15/03/2025", patient: "Mario Rossi", description: "Visita specialistica ortopedica + esami diagnostici", amount: parseFloat(amt), tax: parseFloat((amt * 0.22).toFixed(2)), total: parseFloat((amt * 1.22).toFixed(2)) }
  }), 2500));
};

// --- NOTIFICATION PANEL ---
const NotificationPanel = ({ notifications, setNotifications, onViewClaim, onClose }) => {
  const unread = notifications.filter(n => !n.read).length;
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const typeIcon = { warning: "⚠️", success: "✅", error: "❌", info: "ℹ️" };
  const typeBg = { warning: "#fffbeb", success: "#f0fdf4", error: "#fef2f2", info: "#eff6ff" };

  return (
    <div style={{ position: "absolute", top: 52, right: 0, width: 380, background: "#fff", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", zIndex: 1001, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Notifiche {unread > 0 && <span style={{ background: "#dc2626", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 11, marginLeft: 6 }}>{unread}</span>}</span>
        {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#2d5a8e", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Segna tutte lette</button>}
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Nessuna notifica</div>
        ) : notifications.map(n => (
          <div key={n.id} onClick={() => { markRead(n.id); if (n.claimId) onViewClaim(n.claimId); onClose(); }}
            style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: n.read ? "#fff" : typeBg[n.type], transition: "background 0.2s" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{typeIcon[n.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: n.read ? 500 : 700, fontSize: 14, color: "#1e293b" }}>{n.title}</span>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#2d5a8e", flexShrink: 0 }} />}
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{n.message}</p>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#94a3b8" }}>{n.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- INTEGRATE DOCS MODAL ---
const IntegrateDocsModal = ({ claim, setClaims, setNotifications, onClose, userName }) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [done, setDone] = useState(false);

  const handleUpload = async (docType) => {
    setUploading(true);
    const isPrescription = docType.toLowerCase().includes("prescrizione");
    const result = await simulateOCR(isPrescription ? "prescrizione" : "fattura");
    setUploaded(prev => [...prev, docType]);
    setOcrResults(prev => [...prev, { docType, data: result.data }]);
    setUploading(false);
  };

  const submitIntegration = () => {
    const now = new Date();
    const ts = `${now.toLocaleDateString("it-IT")} ${now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;
    setClaims(prev => prev.map(c => {
      if (c.id !== claim.id) return c;
      const newMissing = (c.missing || []).filter(m => !uploaded.includes(m));
      return {
        ...c,
        status: newMissing.length === 0 ? "in_elaborazione" : "da_integrare",
        docs: [...c.docs, ...uploaded],
        missing: newMissing.length === 0 ? undefined : newMissing,
        notes: newMissing.length === 0 ? "Documentazione integrata — pratica riammessa in elaborazione" : `Documenti ancora mancanti: ${newMissing.join(", ")}`,
        history: [...(c.history || []), { date: ts, action: `Documenti integrati: ${uploaded.join(", ")}`, by: userName }]
      };
    }));
    setNotifications(prev => [...prev, {
      id: Date.now(), userId: claim.userId, date: now.toLocaleDateString("it-IT"),
      title: "Documenti integrati", message: `I documenti mancanti per la pratica ${claim.id} sono stati caricati con successo.`,
      claimId: claim.id, read: false, type: "success"
    }]);
    setDone(true);
  };

  const remaining = (claim.missing || []).filter(m => !uploaded.includes(m));

  return (
    <Modal title={`Integrazione documenti — ${claim.id}`} subtitle={`${claim.type} — ${claim.beneficiary}`} onClose={onClose}>
      <div style={{ padding: 28 }}>
        {!done ? (
          <>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <p style={{ fontWeight: 700, color: "#dc2626", margin: "0 0 8px", fontSize: 14 }}>⚠️ Documenti richiesti dal back-office</p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{claim.notes}</p>
            </div>
            {(claim.missing || []).map(doc => (
              <div key={doc} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 12, background: uploaded.includes(doc) ? "#f0fdf4" : "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{uploaded.includes(doc) ? "✅" : "📄"}</span>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{doc}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: uploaded.includes(doc) ? "#059669" : "#dc2626" }}>
                        {uploaded.includes(doc) ? "Caricato e verificato con OCR" : "Documento obbligatorio"}
                      </p>
                    </div>
                  </div>
                  {!uploaded.includes(doc) && (
                    <Btn variant="secondary" onClick={() => handleUpload(doc)} disabled={uploading} style={{ fontSize: 13 }}>
                      {uploading ? "Scansione..." : "📤 Carica"}
                    </Btn>
                  )}
                </div>
                {ocrResults.find(r => r.docType === doc) && (
                  <div style={{ marginTop: 12, padding: 12, background: "#f0fdf4", borderRadius: 8, fontSize: 13 }}>
                    <p style={{ fontWeight: 600, color: "#166534", margin: "0 0 6px" }}>Dati estratti dall'OCR:</p>
                    {Object.entries(ocrResults.find(r => r.docType === doc).data).slice(0, 4).map(([k, v]) => (
                      <span key={k} style={{ display: "inline-block", background: "#dcfce7", borderRadius: 6, padding: "2px 8px", margin: "2px 4px 2px 0", color: "#166534" }}>{k}: {v}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
              <Btn variant="secondary" onClick={onClose}>Annulla</Btn>
              <Btn onClick={submitIntegration} disabled={uploaded.length === 0}>
                📤 Invia integrazione {uploaded.length > 0 && `(${uploaded.length} doc)`}
              </Btn>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h3 style={{ color: "#059669", margin: "0 0 8px" }}>Documentazione integrata!</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 4px" }}>
              {remaining.length === 0
                ? "Tutti i documenti richiesti sono stati caricati. La pratica è stata riammessa in elaborazione."
                : `Documenti caricati. Restano da integrare: ${remaining.join(", ")}`}
            </p>
            <Btn onClick={onClose} style={{ marginTop: 20 }}>Chiudi</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
};

// --- NEW CLAIM WIZARD ---
const NewClaimWizard = ({ user, claims, setClaims, setNotifications, onClose, loggedIn }) => {
  const [step, setStep] = useState(0);
  const [beneficiary, setBeneficiary] = useState(user.name);
  const [careType, setCareType] = useState("");
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanningInvoice, setScanningInvoice] = useState(false);
  const [notes, setNotes] = useState("");

  const beneficiaryOptions = [
    { value: user.name, label: `${user.name} (Titolare)` },
    ...(user.familyMembers || []).map(m => ({ value: m.name, label: `${m.name} (${m.relation})` }))
  ];

  const handlePrescriptionUpload = async () => {
    setScanning(true);
    const result = await simulateOCR("prescrizione");
    setPrescriptionData(result.data);
    setScanning(false);
  };

  const handleInvoiceUpload = async () => {
    setScanningInvoice(true);
    const result = await simulateOCR("fattura");
    setInvoiceData(prev => [...prev, result.data]);
    setScanningInvoice(false);
  };

  const totalAmount = invoiceData.reduce((s, i) => s + i.total, 0);

  const submitClaim = (asDraft) => {
    const missingDocs = [];
    if (!prescriptionData) missingDocs.push("Prescrizione medica");
    if (invoiceData.length === 0) missingDocs.push("Almeno una fattura");
    const now = new Date();
    const ts = `${now.toLocaleDateString("it-IT")} ${now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;
    const newId = `ROL-2024-${String(claims.length + 70).padStart(4, "0")}`;
    const status = asDraft ? "bozza" : (missingDocs.length > 0 ? "da_integrare" : "in_elaborazione");
    const newClaim = {
      id: newId, date: now.toLocaleDateString("it-IT"), userId: loggedIn, beneficiary, type: careType, status,
      amount: totalAmount || null, reimbursed: null,
      docs: [prescriptionData && "Prescrizione medica", ...invoiceData.map((_, i) => `Fattura ${i + 1}`)].filter(Boolean),
      notes: asDraft ? "Pratica in fase di compilazione" : (missingDocs.length > 0 ? `Documenti mancanti: ${missingDocs.join(", ")}` : "Pratica inviata, in attesa di elaborazione"),
      missing: missingDocs.length > 0 && !asDraft ? missingDocs : undefined,
      prescriptionData, invoiceData,
      history: [{ date: ts, action: asDraft ? "Bozza creata" : "Pratica creata e inviata", by: user.name }]
    };
    setClaims(prev => [newClaim, ...prev]);
    if (!asDraft) {
      setNotifications(prev => [...prev, {
        id: Date.now(), userId: loggedIn, date: now.toLocaleDateString("it-IT"),
        title: status === "da_integrare" ? "Integrazione necessaria" : "Pratica inviata",
        message: status === "da_integrare" ? `La pratica ${newId} è incompleta. Documenti mancanti: ${missingDocs.join(", ")}` : `La pratica ${newId} è stata inviata e sarà elaborata dal back-office.`,
        claimId: newId, read: false, type: status === "da_integrare" ? "warning" : "info"
      }]);
    }
    onClose();
  };

  const steps = ["Beneficiario", "Prescrizione", "Fatture", "Riepilogo"];

  return (
    <Modal title="Nuova Richiesta Online (ROL)" subtitle={`Step ${step + 1} di ${steps.length}: ${steps[step]}`} onClose={onClose}>
      <div style={{ display: "flex", padding: "16px 28px 0", gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "#1e3a5f" : "#e2e8f0", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ padding: 28 }}>
        {step === 0 && (
          <>
            <Select label="Beneficiario della prestazione" value={beneficiary} onChange={setBeneficiary} options={beneficiaryOptions} required />
            <Select label="Tipo di prestazione" value={careType} onChange={setCareType} options={CARE_TYPES} required />
            <Input label="Note aggiuntive (facoltativo)" value={notes} onChange={setNotes} placeholder="Eventuali dettagli..." />
          </>
        )}
        {step === 1 && (
          <>
            <h3 style={{ fontSize: 16, color: "#1e293b", margin: "0 0 8px" }}>📋 Prescrizione Medica</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>Carica la prescrizione del medico. Il sistema estrarrà automaticamente i dati tramite OCR.</p>
            {!prescriptionData && !scanning && (
              <div onClick={handlePrescriptionUpload} style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: 40, textAlign: "center", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1e3a5f"} onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                <p style={{ fontWeight: 600, color: "#334155", margin: "0 0 4px" }}>Clicca per caricare la prescrizione</p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>PDF, JPG o PNG — max 10MB</p>
              </div>
            )}
            {scanning && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12, animation: "spin 1s linear infinite" }}>🔄</div>
                <p style={{ fontWeight: 600, color: "#1e3a5f" }}>Analisi OCR in corso...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            {prescriptionData && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <span style={{ fontWeight: 700, color: "#166534" }}>Prescrizione acquisita con successo</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
                  {Object.entries({ "Medico": prescriptionData.doctor, "Specialità": prescriptionData.specialty, "Data": prescriptionData.date, "Paziente": prescriptionData.patient, "Diagnosi": prescriptionData.diagnosis, "Prestazione": prescriptionData.prescribedCare }).map(([k, v]) => (
                    <div key={k}><span style={{ color: "#64748b", fontSize: 12 }}>{k}</span><br /><span style={{ color: "#1e293b", fontWeight: 500 }}>{v}</span></div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <h3 style={{ fontSize: 16, color: "#1e293b", margin: "0 0 8px" }}>🧾 Fatture</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>Carica una o più fatture relative alla prestazione.</p>
            {invoiceData.map((inv, i) => (
              <div key={i} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: "#1e40af" }}>🧾 Fattura {i + 1} — {inv.invoiceNo}</span>
                  <button onClick={() => setInvoiceData(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 13 }}>Rimuovi</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: "#64748b" }}>Fornitore:</span> {inv.provider}</div>
                  <div><span style={{ color: "#64748b" }}>P.IVA:</span> {inv.vat}</div>
                  <div style={{ gridColumn: "1/-1", textAlign: "right", fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>Totale: €{inv.total.toFixed(2)}</div>
                </div>
              </div>
            ))}
            {scanningInvoice ? (
              <div style={{ textAlign: "center", padding: 30, border: "1px dashed #cbd5e1", borderRadius: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 8, animation: "spin 1s linear infinite" }}>🔄</div>
                <p style={{ fontWeight: 600, color: "#1e3a5f", margin: 0 }}>Scansione fattura in corso...</p>
              </div>
            ) : (
              <div onClick={handleInvoiceUpload} style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: 30, textAlign: "center", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1e3a5f"} onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>➕</div>
                <p style={{ fontWeight: 600, color: "#334155", margin: "0 0 4px" }}>{invoiceData.length === 0 ? "Carica la prima fattura" : "Aggiungi un'altra fattura"}</p>
              </div>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <h3 style={{ fontSize: 16, color: "#1e293b", margin: "0 0 16px" }}>📝 Riepilogo Pratica</h3>
            {(() => { const m = []; if (!prescriptionData) m.push("Prescrizione medica"); if (invoiceData.length === 0) m.push("Almeno una fattura"); return m; })().length > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <p style={{ fontWeight: 700, color: "#dc2626", margin: "0 0 8px" }}>⚠️ Documenti mancanti</p>
                {(() => { const m = []; if (!prescriptionData) m.push("Prescrizione medica"); if (invoiceData.length === 0) m.push("Almeno una fattura"); return m; })().map(d => (
                  <p key={d} style={{ margin: "4px 0", fontSize: 14, color: "#991b1b" }}>• {d}</p>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
              {[["Beneficiario", beneficiary], ["Tipo", careType || "—"], ["Documenti", `${(prescriptionData ? 1 : 0) + invoiceData.length}`]].map(([k, v]) => (
                <Card key={k} style={{ padding: 16 }}><p style={{ color: "#64748b", fontSize: 12, margin: "0 0 4px" }}>{k}</p><p style={{ fontWeight: 600, margin: 0 }}>{v}</p></Card>
              ))}
              <Card style={{ padding: 16 }}><p style={{ color: "#64748b", fontSize: 12, margin: "0 0 4px" }}>Importo totale</p><p style={{ fontWeight: 700, fontSize: 18, color: "#1e3a5f", margin: 0 }}>€{totalAmount.toFixed(2)}</p></Card>
            </div>
            <div style={{ marginTop: 16, padding: 16, background: "#f8fafc", borderRadius: 12, fontSize: 13, color: "#64748b" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#334155" }}>Coordinate bancarie per il rimborso</p>
              <p style={{ margin: 0 }}>{user.bank} — {user.iban}</p>
            </div>
          </>
        )}
      </div>
      <div style={{ padding: "16px 28px 24px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9" }}>
        <Btn variant="secondary" onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}>{step === 0 ? "Annulla" : "← Indietro"}</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          {step === 3 && <Btn variant="secondary" onClick={() => submitClaim(true)}>💾 Salva bozza</Btn>}
          {step < 3 ? <Btn onClick={() => setStep(s => s + 1)} disabled={step === 0 && !careType}>Avanti →</Btn> : <Btn onClick={() => submitClaim(false)}>📤 Invia pratica</Btn>}
        </div>
      </div>
    </Modal>
  );
};

// --- CLAIM DETAIL ---
const ClaimDetail = ({ claim, onClose, onIntegrate, isBackoffice, onStatusChange }) => {
  const [boNote, setBoNote] = useState("");

  return (
    <Modal title={`Pratica ${claim.id}`} subtitle={`${claim.date} — ${claim.beneficiary}`} onClose={onClose} width={650}>
      <div style={{ padding: 28 }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <StatusBadge status={claim.status} />
          {claim.amount && <span style={{ fontSize: 14, color: "#64748b" }}>Richiesto: <strong>€{claim.amount.toFixed(2)}</strong></span>}
          {claim.reimbursed != null && <span style={{ fontSize: 14, color: "#059669" }}>Rimborsato: <strong>€{claim.reimbursed.toFixed(2)}</strong></span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14, marginBottom: 20 }}>
          {[["Beneficiario", claim.beneficiary], ["Tipo", claim.type], ["Assicurato", claim.userId], ["Operatore", claim.assignedTo ? USERS[claim.assignedTo]?.name || "—" : "Non assegnato"]].map(([k, v]) => (
            <div key={k}><span style={{ color: "#64748b", fontSize: 12 }}>{k}</span><br /><span style={{ fontWeight: 600 }}>{v}</span></div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px" }}>📎 Documenti allegati</p>
          {claim.docs.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 4, fontSize: 13 }}>📄 {d}</div>
          ))}
          {(!claim.docs || claim.docs.length === 0) && <p style={{ color: "#94a3b8", fontSize: 13 }}>Nessun documento allegato</p>}
        </div>
        {claim.missing && claim.missing.length > 0 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, color: "#dc2626", margin: "0 0 8px", fontSize: 14 }}>⚠️ Documentazione da integrare</p>
            {claim.missing.map(m => <p key={m} style={{ margin: "4px 0", fontSize: 13, color: "#991b1b" }}>• {m}</p>)}
            {!isBackoffice && <Btn variant="danger" style={{ marginTop: 12, fontSize: 13 }} onClick={onIntegrate}>📤 Carica documenti mancanti</Btn>}
          </div>
        )}
        {claim.history && claim.history.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 12px" }}>📜 Cronologia</p>
            <div style={{ borderLeft: "2px solid #e2e8f0", paddingLeft: 20, marginLeft: 8 }}>
              {claim.history.map((h, i) => (
                <div key={i} style={{ marginBottom: 16, position: "relative" }}>
                  <div style={{ position: "absolute", left: -27, top: 4, width: 12, height: 12, borderRadius: 6, background: i === 0 ? "#1e3a5f" : "#cbd5e1", border: "2px solid #fff" }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{h.action}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{h.date} — {h.by}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {isBackoffice && claim.status !== "rimborsata" && claim.status !== "respinta" && (
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px", color: "#1e3a5f" }}>🏢 Azioni Back-Office</p>
            <Input label="Note operatore" value={boNote} onChange={setBoNote} placeholder="Motivazione o note..." />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {claim.status === "bozza" && <Btn variant="warning" onClick={() => onStatusChange(claim.id, "in_elaborazione", boNote)}>⏳ Prendi in carico</Btn>}
              {claim.status === "in_elaborazione" && (
                <>
                  <Btn variant="success" onClick={() => onStatusChange(claim.id, "rimborsata", boNote)}>✅ Approva rimborso</Btn>
                  <Btn variant="warning" onClick={() => onStatusChange(claim.id, "da_integrare", boNote)}>⚠️ Richiedi integrazione</Btn>
                  <Btn variant="danger" onClick={() => onStatusChange(claim.id, "respinta", boNote)}>❌ Respingi</Btn>
                </>
              )}
              {claim.status === "da_integrare" && (
                <>
                  <Btn variant="primary" onClick={() => onStatusChange(claim.id, "in_elaborazione", boNote)}>⏳ Riammetti</Btn>
                  <Btn variant="danger" onClick={() => onStatusChange(claim.id, "respinta", boNote)}>❌ Respingi</Btn>
                </>
              )}
            </div>
          </div>
        )}
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Note</p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{claim.notes}</p>
        </div>
      </div>
    </Modal>
  );
};

// ==================== MAIN APP ====================
function App() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [view, setView] = useState("dashboard");
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [integrateClaim, setIntegrateClaim] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [boSearch, setBoSearch] = useState("");
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!loggedIn) return <LoginPage onLogin={setLoggedIn} />;
  const user = USERS[loggedIn];
  const isBackoffice = user.role === "backoffice";
  const userNotifications = notifications.filter(n => isBackoffice || n.userId === loggedIn);
  const unreadCount = userNotifications.filter(n => !n.read).length;
  const userClaims = isBackoffice ? claims : claims.filter(c => c.userId === loggedIn);
  const filteredClaims = (statusFilter === "all" ? userClaims : userClaims.filter(c => c.status === statusFilter))
    .filter(c => !boSearch || c.id.toLowerCase().includes(boSearch.toLowerCase()) || c.beneficiary.toLowerCase().includes(boSearch.toLowerCase()));

  const stats = {
    total: userClaims.length, bozza: userClaims.filter(c => c.status === "bozza").length,
    in_elaborazione: userClaims.filter(c => c.status === "in_elaborazione").length,
    da_integrare: userClaims.filter(c => c.status === "da_integrare").length,
    rimborsata: userClaims.filter(c => c.status === "rimborsata").length,
    respinta: userClaims.filter(c => c.status === "respinta").length,
    totalReimbursed: userClaims.filter(c => c.reimbursed).reduce((s, c) => s + c.reimbursed, 0),
    totalRequested: userClaims.filter(c => c.amount).reduce((s, c) => s + c.amount, 0)
  };

  const handleStatusChange = (claimId, newStatus, note) => {
    const now = new Date();
    const ts = `${now.toLocaleDateString("it-IT")} ${now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;
    const actionMap = { in_elaborazione: "Presa in carico", rimborsata: "Rimborso approvato", da_integrare: "Richiesta integrazione documentale", respinta: "Pratica respinta" };
    setClaims(prev => prev.map(c => {
      if (c.id !== claimId) return c;
      const reimbursed = newStatus === "rimborsata" ? Math.round(c.amount * 0.8 * 100) / 100 : c.reimbursed;
      return { ...c, status: newStatus, reimbursed, assignedTo: c.assignedTo || loggedIn,
        notes: note || c.notes,
        missing: newStatus === "da_integrare" ? (note ? [note] : ["Documentazione aggiuntiva"]) : (newStatus === "in_elaborazione" ? undefined : c.missing),
        history: [...(c.history || []), { date: ts, action: `${actionMap[newStatus]}${note ? ` — ${note}` : ""}`, by: user.name }]
      };
    }));
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      const notifMap = {
        rimborsata: { title: "Rimborso erogato", type: "success", msg: `Il rimborso per ${claimId} è stato approvato.` },
        respinta: { title: "Pratica respinta", type: "error", msg: `La pratica ${claimId} è stata respinta.${note ? ` Motivo: ${note}` : ""}` },
        da_integrare: { title: "Integrazione richiesta", type: "warning", msg: `La pratica ${claimId} necessita di documentazione aggiuntiva.` },
        in_elaborazione: { title: "Pratica in lavorazione", type: "info", msg: `La pratica ${claimId} è stata presa in carico.` }
      };
      const n = notifMap[newStatus];
      if (n) setNotifications(prev => [...prev, { id: Date.now(), userId: claim.userId, date: now.toLocaleDateString("it-IT"), title: n.title, message: n.msg, claimId, read: false, type: n.type }]);
    }
    setSelectedClaim(null);
  };

  const viewClaimById = (id) => { const c = claims.find(cl => cl.id === id); if (c) setSelectedClaim(c); };

  const sidebarItems = isBackoffice
    ? [["dashboard", "📊", "Dashboard"], ["claims", "📁", "Tutte le pratiche"]]
    : [["dashboard", "📊", "Dashboard"], ["claims", "📁", "Le mie pratiche"], ["profile", "👤", "Il mio profilo"]];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f1f5f9" }}>
      {/* SIDEBAR */}
      <div style={{ width: 260, background: "linear-gradient(180deg, #0f2439, #1e3a5f)", color: "#fff", padding: "24px 0", display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>JUNO</h1>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>{isBackoffice ? "BACK-OFFICE" : "ASSICURAZIONI"}</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1 }}>
          {sidebarItems.map(([v, icon, label]) => (
            <div key={v} onClick={() => { setView(v); setStatusFilter("all"); }}
              style={{ padding: "12px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 14,
                background: view === v ? "rgba(255,255,255,0.1)" : "transparent",
                borderLeft: view === v ? "3px solid #60a5fa" : "3px solid transparent",
                color: view === v ? "#fff" : "#94a3b8", fontWeight: view === v ? 600 : 400 }}>
              <span>{icon}</span> {label}
            </div>
          ))}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 4px" }}>{user.name}</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 12px" }}>{isBackoffice ? user.position : `Polizza: ${user.policyType}`}</p>
          <button onClick={() => { setLoggedIn(null); setView("dashboard"); setStatusFilter("all"); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, width: "100%" }}>🚪 Esci</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto", minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 24, gap: 12, position: "relative" }} ref={notifRef}>
          {!isBackoffice && <Btn onClick={() => setShowNewClaim(true)} style={{ fontSize: 15, padding: "12px 24px" }}>➕ Nuova ROL</Btn>}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", cursor: "pointer", fontSize: 18, position: "relative" }}>
              🔔{unreadCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#dc2626", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{unreadCount}</span>}
            </button>
            {showNotifications && <NotificationPanel notifications={userNotifications} setNotifications={setNotifications} onViewClaim={viewClaimById} onClose={() => setShowNotifications(false)} />}
          </div>
        </div>

        {/* DASHBOARD */}
        {view === "dashboard" && !isBackoffice && (
          <>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 24, color: "#1e293b" }}>Benvenuto, {user.name.split(" ")[0]}</h2>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Polizza {user.policy} — valida fino al {user.validTo}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[["Totale pratiche", stats.total, "📋", "#1e3a5f"], ["In elaborazione", stats.in_elaborazione, "⏳", "#d97706"], ["Da integrare", stats.da_integrare, "⚠️", "#dc2626"], ["Rimborsate", `€${stats.totalReimbursed.toFixed(0)}`, "💰", "#059669"]].map(([l, v, ic, col]) => (
                <Card key={l} style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px" }}>{l}</p><p style={{ fontSize: 28, fontWeight: 800, color: col, margin: 0 }}>{v}</p></div><span style={{ fontSize: 28 }}>{ic}</span></div></Card>
              ))}
            </div>
            {userClaims.filter(c => c.status === "da_integrare").length > 0 && (
              <Card style={{ marginBottom: 28, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#92400e" }}>⚠️ Azione richiesta</h3>
                {userClaims.filter(c => c.status === "da_integrare").map(c => (
                  <div key={c.id} onClick={() => setIntegrateClaim(c)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #fde68a", cursor: "pointer" }}>
                    <div><span style={{ fontWeight: 600 }}>{c.id}</span><span style={{ color: "#64748b", marginLeft: 12, fontSize: 13 }}>{c.type} — {c.beneficiary}</span></div>
                    <span style={{ color: "#d97706", fontSize: 13, fontWeight: 600 }}>Integra documenti →</span>
                  </div>
                ))}
              </Card>
            )}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Ultime pratiche</h3>
                <button onClick={() => setView("claims")} style={{ background: "none", border: "none", color: "#2d5a8e", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Vedi tutte →</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  {["Pratica", "Data", "Beneficiario", "Tipo", "Importo", "Stato"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#64748b", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>{h}</th>)}
                </tr></thead>
                <tbody>{userClaims.slice(0, 5).map(c => (
                  <tr key={c.id} onClick={() => setSelectedClaim(c)} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                    <td style={{ padding: 12, fontWeight: 600, color: "#1e3a5f" }}>{c.id}</td>
                    <td style={{ padding: 12, color: "#64748b" }}>{c.date}</td>
                    <td style={{ padding: 12 }}>{c.beneficiary}</td>
                    <td style={{ padding: 12 }}>{c.type}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{c.amount ? `€${c.amount.toFixed(2)}` : "—"}</td>
                    <td style={{ padding: 12 }}><StatusBadge status={c.status} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
          </>
        )}

        {/* BACKOFFICE DASHBOARD */}
        {view === "dashboard" && isBackoffice && (
          <>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 24, color: "#1e293b" }}>Back-Office — {user.name}</h2>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>{user.position}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 28 }}>
              {[["Totale", stats.total, "📋", "#1e3a5f"], ["Bozze", stats.bozza, "✏️", "#6B7280"], ["In lavorazione", stats.in_elaborazione, "⏳", "#d97706"], ["Da integrare", stats.da_integrare, "⚠️", "#dc2626"], ["Rimborsate", stats.rimborsata, "✅", "#059669"]].map(([l, v, ic, col]) => (
                <Card key={l} style={{ padding: 16 }}><p style={{ color: "#64748b", fontSize: 12, margin: "0 0 6px" }}>{l}</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 24, fontWeight: 800, color: col }}>{v}</span><span style={{ fontSize: 22 }}>{ic}</span></div></Card>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              <Card style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#1e3a5f" }}>💰 Volume economico</h3>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Richiesto</p><p style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>€{stats.totalRequested.toFixed(0)}</p></div>
                  <div><p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Rimborsato</p><p style={{ fontSize: 20, fontWeight: 800, color: "#059669", margin: 0 }}>€{stats.totalReimbursed.toFixed(0)}</p></div>
                </div>
              </Card>
              <Card style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#1e3a5f" }}>📌 Le mie assegnazioni</h3>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>{claims.filter(c => c.assignedTo === loggedIn).length}</p>
              </Card>
            </div>
            {claims.filter(c => !c.assignedTo && c.status !== "bozza").length > 0 && (
              <Card style={{ marginBottom: 28, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#1e40af" }}>📥 Pratiche non assegnate</h3>
                {claims.filter(c => !c.assignedTo && c.status !== "bozza").map(c => (
                  <div key={c.id} onClick={() => setSelectedClaim(c)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #bfdbfe", cursor: "pointer" }}>
                    <div><span style={{ fontWeight: 600 }}>{c.id}</span><span style={{ color: "#64748b", marginLeft: 12, fontSize: 13 }}>{c.beneficiary} — {c.type}</span></div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </Card>
            )}
          </>
        )}

        {/* CLAIMS LIST */}
        {view === "claims" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 24, color: "#1e293b" }}>{isBackoffice ? "Tutte le pratiche" : "Storico Pratiche"}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {isBackoffice && <Input value={boSearch} onChange={setBoSearch} placeholder="Cerca per ID o nome..." />}
                {!isBackoffice && <Btn onClick={() => setShowNewClaim(true)}>➕ Nuova ROL</Btn>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {[["all", "Tutte", stats.total], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label, stats[k]])].map(([key, label, count]) => (
                <button key={key} onClick={() => setStatusFilter(key)}
                  style={{ padding: "8px 16px", borderRadius: 20, border: statusFilter === key ? "2px solid #1e3a5f" : "1px solid #e2e8f0",
                    background: statusFilter === key ? "#1e3a5f" : "#fff", color: statusFilter === key ? "#fff" : "#475569", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  {label} ({count})
                </button>
              ))}
            </div>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead><tr style={{ background: "#f8fafc" }}>
                    {["Pratica", "Data", isBackoffice && "Assicurato", "Beneficiario", "Tipo", "Importo", "Rimborso", isBackoffice && "Operatore", "Stato"].filter(Boolean).map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "14px 16px", color: "#64748b", fontWeight: 600, fontSize: 12, textTransform: "uppercase", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{filteredClaims.map(c => (
                    <tr key={c.id} onClick={() => setSelectedClaim(c)} style={{ cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1e3a5f" }}>{c.id}</td>
                      <td style={{ padding: "14px 16px", color: "#64748b" }}>{c.date}</td>
                      {isBackoffice && <td style={{ padding: "14px 16px", fontSize: 13 }}>{c.userId}</td>}
                      <td style={{ padding: "14px 16px" }}>{c.beneficiary}</td>
                      <td style={{ padding: "14px 16px" }}>{c.type}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>{c.amount ? `€${c.amount.toFixed(2)}` : "—"}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: c.reimbursed > 0 ? "#059669" : "#64748b" }}>{c.reimbursed != null ? `€${c.reimbursed.toFixed(2)}` : "—"}</td>
                      {isBackoffice && <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{c.assignedTo ? USERS[c.assignedTo]?.name?.split(" ")[0] : "—"}</td>}
                      <td style={{ padding: "14px 16px" }}><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {filteredClaims.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Nessuna pratica trovata.</div>}
            </Card>
          </>
        )}

        {/* PROFILE */}
        {view === "profile" && !isBackoffice && (
          <>
            <h2 style={{ margin: "0 0 24px", fontSize: 24, color: "#1e293b" }}>Il mio profilo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1e3a5f" }}>👤 Dati personali</h3>
                {[["Nome", user.name], ["Codice fiscale", user.cf], ["Email", user.email], ["Telefono", user.phone], ["Indirizzo", user.address]].map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 12 }}><p style={{ color: "#64748b", fontSize: 12, margin: "0 0 2px" }}>{k}</p><p style={{ fontWeight: 500, margin: 0, fontSize: 14 }}>{v}</p></div>
                ))}
              </Card>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1e3a5f" }}>🛡️ Polizza</h3>
                {[["Numero", user.policy], ["Tipo", user.policyType], ["Validità", `${user.validFrom} — ${user.validTo}`], ["ID", user.id]].map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 12 }}><p style={{ color: "#64748b", fontSize: 12, margin: "0 0 2px" }}>{k}</p><p style={{ fontWeight: 500, margin: 0, fontSize: 14 }}>{v}</p></div>
                ))}
              </Card>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1e3a5f" }}>🏦 Coordinate bancarie</h3>
                {[["Banca", user.bank], ["IBAN", user.iban]].map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 12 }}><p style={{ color: "#64748b", fontSize: 12, margin: "0 0 2px" }}>{k}</p><p style={{ fontWeight: 500, margin: 0, fontSize: 14, fontFamily: k === "IBAN" ? "monospace" : "inherit" }}>{v}</p></div>
                ))}
              </Card>
              <Card>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1e3a5f" }}>👨‍👩‍👧 Nucleo familiare</h3>
                {(user.familyMembers || []).length === 0 ? <p style={{ color: "#94a3b8", fontSize: 14 }}>Nessun familiare</p> : (user.familyMembers || []).map((m, i) => (
                  <div key={i} style={{ padding: 12, background: "#f8fafc", borderRadius: 10, marginBottom: 8 }}>
                    <p style={{ fontWeight: 600, margin: "0 0 4px", fontSize: 14 }}>{m.name}</p>
                    <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{m.relation} — CF: {m.cf}</p>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {showNewClaim && !isBackoffice && <NewClaimWizard user={user} claims={claims} setClaims={setClaims} setNotifications={setNotifications} onClose={() => setShowNewClaim(false)} loggedIn={loggedIn} />}
      {selectedClaim && <ClaimDetail claim={selectedClaim} onClose={() => setSelectedClaim(null)} onIntegrate={() => { setIntegrateClaim(selectedClaim); setSelectedClaim(null); }} isBackoffice={isBackoffice} onStatusChange={handleStatusChange} />}
      {integrateClaim && <IntegrateDocsModal claim={integrateClaim} setClaims={setClaims} setNotifications={setNotifications} onClose={() => setIntegrateClaim(null)} userName={user.name} />}
    </div>
  );
}

export default App;

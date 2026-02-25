import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ContractService from "../../services/ContractService";

/* ───────────── helpers ───────────── */

const formatCPF = (cpf) => {
  if (!cpf) return "-";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const roleLabel = (role, index) => {
  if (role === "CONTRACTOR") return "Contratante";
  if (role === "CONTRACTED") return "Contratada";
  if (role === "WITNESS") return `Testemunha ${index ?? ""}`;
  return role;
};

/* ───────────── icons (inline SVG) ───────────── */

const ChevronDown = ({ open }) => (
  <svg
    style={{
      width: 20,
      height: 20,
      transition: "transform .25s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      flexShrink: 0,
    }}
    fill="none"
    stroke="#6B7280"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#22c55e" />
    <path d="M8 12l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#f59e0b" />
    <path d="M12 7v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ───────────── sub‑components ───────────── */

function SignatureBadge({ signed }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        color: signed ? "#16a34a" : "#d97706",
        background: signed ? "#f0fdf4" : "#fffbeb",
        border: `1px solid ${signed ? "#bbf7d0" : "#fde68a"}`,
        borderRadius: 999,
        padding: "4px 12px",
        marginTop: 8,
      }}
    >
      {signed ? <CheckIcon /> : <ClockIcon />}
      {signed ? "Assinado" : "Aguardando assinatura"}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 6 }}>
      <p style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", margin: 0, letterSpacing: ".4px" }}>
        {label}
      </p>
      <p style={{ fontSize: 14, color: "#1f2937", margin: "2px 0 0" }}>{value}</p>
    </div>
  );
}

function ParticipantCard({ name, roleText, signed, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        transition: "box-shadow .2s",
        boxShadow: open ? "0 2px 8px rgba(0,0,0,.06)" : "none",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: open ? "#f9fafb" : "#fff",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background .2s",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, color: "#1f2937" }}>
          {name} <span style={{ fontWeight: 400, color: "#6b7280" }}>({roleText})</span>
        </span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div style={{ padding: "12px 18px 16px", borderTop: "1px solid #f3f4f6" }}>
          {children}
          <SignatureBadge signed={signed} />
        </div>
      )}

      {!open && (
        <div style={{ padding: "0 18px 14px" }}>
          <SignatureBadge signed={signed} />
        </div>
      )}
    </div>
  );
}

/* ───────────── company static data ───────────── */

const LP_KIDS = {
  razaoSocial: "LUANA PEREIRA DOS SANTOS LIMA",
  nomeFantasia: "LP Kids",
  cnpj: "46.210.211/0001-60",
  endereco: "Rua Dr. Francisco das Chagas Ribeiro, 38",
  bairro: "Bairro Mineiro Segundo - Cametá/PA",
  cep: "68.400-000",
  descricao: "Centro de Educação Inclusiva e Reabilitação Cognitiva e Psicomotora",
};

/* ───────────── confirmation modal ───────────── */

function ConfirmSignModal({ participant, patient, onConfirm, onCancel, signing }) {
  const person = participant?.guardian || participant?.user || {};
  const personName = person.name || "Participante";

  return (
    <div style={modalStyles.overlay} onClick={onCancel}>
      <div style={modalStyles.card} onClick={(e) => e.stopPropagation()}>
        <h2 style={modalStyles.title}>Confirmar dados para assinar</h2>

        <p style={modalStyles.description}>
          <strong>{personName},</strong> confirme seus dados abaixo para assinar o documento.
        </p>

        <div style={modalStyles.dataRows}>
          <div style={modalStyles.dataRow}>
            <span style={modalStyles.dataLabel}>CPF:</span>
            <span style={modalStyles.dataValue}>{formatCPF(person.cpf)}</span>
          </div>
          <div style={modalStyles.dataRow}>
            <span style={modalStyles.dataLabel}>E-mail:</span>
            <span style={modalStyles.dataValue}>{person.email || "-"}</span>
          </div>
        </div>

        <div style={modalStyles.actions}>
          <button onClick={onCancel} style={modalStyles.cancelBtn} disabled={signing}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...modalStyles.confirmBtn,
              ...(signing ? { opacity: 0.7, cursor: "not-allowed" } : {}),
            }}
            disabled={signing}
          >
            {signing ? "Assinando..." : "Assinar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(2px)",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "36px 40px",
    maxWidth: 460,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,.15)",
    animation: "fadeInUp .25s ease",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 16px",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    margin: "0 0 24px",
    textAlign: "center",
    lineHeight: 1.5,
  },
  dataRows: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 28,
  },
  dataRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 15,
  },
  dataLabel: {
    fontWeight: 600,
    color: "#374151",
  },
  dataValue: {
    color: "#6b7280",
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  cancelBtn: {
    padding: "12px 32px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background .15s",
  },
  confirmBtn: {
    padding: "12px 32px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 10,
    border: "none",
    background: "#3D75C4",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background .15s",
  },
};

/* ───────────── main page ───────────── */

export default function ContractSignPage() {
  const { token } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (token) loadContract();
  }, [token]);

  const loadContract = async () => {
    try {
      const data = await ContractService.getByToken(token);
      if (!data) return;
      setContract(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSign = async () => {
    setSigning(true);
    try {
      await ContractService.sign(token);
      setShowConfirmModal(false);
      setSigned(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao assinar contrato.");
    } finally {
      setSigning(false);
    }
  };

  /* current participant from token */
  const currentParticipant = contract?.participants?.find((p) => p.token === token);

  /* ─── loading / error / success states ─── */

  if (loading) {
    return (
      <div style={styles.centeredScreen}>
        <div style={styles.spinner} />
        <p style={{ color: "#6b7280", marginTop: 16 }}>Carregando contrato...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div style={styles.centeredScreen}>
        <p style={{ color: "#ef4444", fontSize: 18 }}>Contrato não encontrado.</p>
      </div>
    );
  }

  if (signed) {
    return (
      <div style={stylesAlert.overlay}>
        <div style={stylesAlert.modal}>
          <div style={stylesAlert.iconWrapper}>
            <CheckIcon />
          </div>

          <h2 style={stylesAlert.title}>
            Contrato assinado com sucesso!
          </h2>

          <p style={stylesAlert.subtitle}>
            O contrato foi encaminhado para assinatura.
          </p>

          <button style={stylesAlert.button} onClick={() => window.close()}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  /* ─── build participants list ─── */

  const { guardian, patient, participants = [] } = contract;

  let witnessCount = 0;
  const participantCards = participants.map((p) => {
    const isContractor = p.role === "CONTRACTOR";
    const isWitness = p.role === "WITNESS";
    if (isWitness) witnessCount++;

    const person = p.guardian || p.user || {};
    const personName = person.name || "Participante";
    const role = isWitness ? `Testemunha ${witnessCount}` : roleLabel(p.role);

    return (
      <ParticipantCard
        key={p.id}
        name={personName}
        roleText={role}
        signed={p.signed}
        defaultOpen={isContractor}
      >
        {isContractor && (
          <>
            <InfoRow label="CPF" value={formatCPF(person.cpf)} />
            <InfoRow label="Qualificação" value="Pessoa Física" />
            <InfoRow
              label="Endereço"
              value={
                person.addressLine1
                  ? `${person.addressLine1}${person.number ? `, ${person.number}` : ""}`
                  : "-"
              }
            />
            <InfoRow label="E-mail" value={person.email} />
            {patient && <InfoRow label="Nome do Paciente" value={patient.name} />}
          </>
        )}
        {isWitness && (
          <>
            <InfoRow label="CPF" value={formatCPF(person.cpf)} />
            <InfoRow label="E-mail" value={person.email} />
          </>
        )}
      </ParticipantCard>
    );
  });

  /* insert LP Kids card after contractor */
  const contractorIdx = participants.findIndex((p) => p.role === "CONTRACTOR");
  const lpKidsCard = (
    <ParticipantCard key="lp-kids" name="LP Kids" roleText="Contratada" signed={false} defaultOpen={false}>
      <InfoRow label="Razão Social" value={LP_KIDS.razaoSocial} />
      <InfoRow label="Nome Fantasia" value={LP_KIDS.nomeFantasia} />
      <InfoRow label="CNPJ" value={LP_KIDS.cnpj} />
      <InfoRow label="Endereço" value={`${LP_KIDS.endereco}\n${LP_KIDS.bairro}\nCEP: ${LP_KIDS.cep}`} />
      <InfoRow label="Descrição" value={LP_KIDS.descricao} />
    </ParticipantCard>
  );

  const allCards = [...participantCards];
  allCards.splice(contractorIdx + 1, 0, lpKidsCard);

  /* ─── PDF URL — adjust to your actual endpoint ─── */
  const pdfUrl = contract.pdfUrl || "/contrato.pdf";

  const alreadySigned = currentParticipant?.signed;

  return (
    <div style={styles.pageWrapper}>
      {/* ─── Header ─── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logoIcon}><img src="/assets/icone_menu/icone.png"></img></span>
          <span style={styles.logoText}>
            GERENC<span style={styles.logoAccent}>IA</span>
          </span>
        </div>
        <button style={styles.closeBtn} title="Fechar">
          <CloseIcon />
        </button>
      </header>

      {/* ─── Page title ─── */}
      <div style={styles.titleSection}>
        <h1 style={styles.title}>Assinatura do contrato</h1>
        <p style={styles.subtitle}>Antes de assinar leia o contrato com atenção</p>
      </div>

      {/* ─── Content ─── */}
      <div style={styles.content}>
        <div style={styles.contentInner}>
          {/* Left — PDF Viewer */}
          <div style={styles.pdfSection}>
            <h3 style={styles.sectionTitle}>PDF do Contrato</h3>
            <div style={styles.pdfContainer}>
              <iframe src={pdfUrl} style={styles.pdfIframe} title="Contrato PDF" />
            </div>
          </div>

          {/* Right — Participants */}
          <div style={styles.participantsSection}>
            <h3 style={styles.sectionTitle}>Informações dos participantes do contrato</h3>
            <div style={styles.cardsList}>{allCards}</div>
          </div>
        </div>
      </div>

      {/* ─── Confirmation Modal ─── */}
      {showConfirmModal && (
        <ConfirmSignModal
          participant={currentParticipant}
          patient={patient}
          onConfirm={handleConfirmSign}
          onCancel={() => setShowConfirmModal(false)}
          signing={signing}
        />
      )}

      {/* ─── Footer action ─── */}
      <div style={styles.footer}>
        <button
          onClick={handleSign}
          disabled={signing || alreadySigned}
          style={{
            ...styles.signBtn,
            ...(signing || alreadySigned ? styles.signBtnDisabled : {}),
          }}
        >
          {alreadySigned ? "Já assinado" : signing ? "Assinando..." : "Assinar documento"}
        </button>
      </div>
    </div>
  );
}

/* ───────────── styles ───────────── */


const stylesAlert = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(3px)",
    zIndex: 9999,
  },

  modal: {
    backgroundColor: "#ffffff",
    padding: "40px 50px",
    borderRadius: "20px",
    textAlign: "center",
    width: "420px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    animation: "fadeIn 0.3s ease",
  },

  iconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#e6f9f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
  },

  subtitle: {
    marginBottom: "24px",
    color: "#6b7280",
    fontSize: "14px",
  },

  button: {
    backgroundColor: "#3D75C4",
    color: "#fff",
    border: "none",
    padding: "10px 28px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f8f9fb",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    fontSize: 24,
    width: "27px"
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1f2937",
    letterSpacing: "-0.5px",
  },
  logoAccent: {
    color: "#3D75C4",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Title area */
  titleSection: {
    padding: "24px 32px 0",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    margin: "4px 0 0",
  },

  /* Content */
  content: {
    flex: 1,
    padding: "24px 32px",
  },
  contentInner: {
    display: "flex",
    gap: 32,
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 32,
    minHeight: 560,
  },

  /* PDF */
  pdfSection: {
    flex: "1 1 58%",
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#3D75C4",
    margin: "0 0 16px",
  },
  pdfContainer: {
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
    height: "calc(100% - 36px)",
    minHeight: 480,
  },
  pdfIframe: {
    width: "100%",
    height: "100%",
    border: "none",
    minHeight: 480,
  },

  /* Participants */
  participantsSection: {
    flex: "1 1 42%",
    minWidth: 280,
  },
  cardsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  /* Footer */
  footer: {
    padding: "20px 32px",
    display: "flex",
    justifyContent: "center",
    background: "#fff",
    borderTop: "1px solid #e5e7eb",
  },
  signBtn: {
    background: "#3D75C4",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 48px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .2s, transform .15s",
    fontFamily: "inherit",
  },
  signBtnDisabled: {
    background: "#93c5fd",
    cursor: "not-allowed",
  },

  /* Utility screens */
  centeredScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e5e7eb",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  successCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 56px",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,.08)",
    border: "1px solid #e5e7eb",
  },
};
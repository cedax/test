"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowLeft, CalendarClock, ChevronDown, ChevronsRight, Clock3,
  File, Inbox, Info, Mail, MailOpen, Menu, MoreHorizontal, PenLine,
  ReceiptText, Reply, Search, Send, ShoppingBag, Sparkles, SquarePlay,
  Star, Tag, Trash2, Users, Video,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import mailbox from "@/data/mailbox.json";

type Message = (typeof mailbox.messages)[number];
type Label = (typeof mailbox.labels)[number];
type SupportThreadEntry = {
  role: string; sender: string; email: string; recipient: string; date: string;
  avatarText: string; avatarColor: string; text: string;
};

const labelIcons = [Inbox, Inbox, Users, Tag, Info, Star, Clock3, ChevronsRight, ShoppingBag, ReceiptText, Send, CalendarClock, SquarePlay, File];

function Avatar({ message }: { message: Message }) {
  if (message.avatarUrl) return <img className="sender-avatar" src={message.avatarUrl} alt="" />;
  return (
    <span className="sender-avatar" style={{ background: message.avatarColor, color: message.avatarTextColor ?? "#eef0f3" }}>
      {message.avatarText || <span className="avatar-person"><i /><i /></span>}
    </span>
  );
}

function DrawerContent({ active, onSelect }: { active: string; onSelect: (label: Label) => void }) {
  return (
    <div className="drawer-inner">
      <header className="drawer-brand">
        <span className="drawer-brand-icon"><img src="/gmail-logo.png" alt="" /></span>
        <span className="drawer-brand-name">Gmail</span>
      </header>
      <div className="drawer-rule" />
      <nav className="drawer-nav" aria-label="Carpetas de correo">
        {mailbox.labels.map((label, index) => {
          const Icon = labelIcons[index] ?? Inbox;
          const accent = label.id === "promotions" ? "green" : label.id === "notifications" ? "peach" : "";
          return (
            <button type="button" key={label.id} className={`${active === label.id ? "selected" : ""} ${index === 5 ? "section-start" : ""}`} onClick={() => onSelect(label)}>
              <Icon aria-hidden="true" /><span>{label.label}</span>{label.count && <em className={accent}>{label.count}</em>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function InboxView({ messages, activeLabel, setActiveLabel, onOpen, onToggleStar }: {
  messages: Message[]; activeLabel: string; setActiveLabel: (label: Label) => void;
  onOpen: (id: string) => void; onToggleStar: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeName = mailbox.labels.find((label) => label.id === activeLabel)?.label ?? "Principal";
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    return messages.filter((message) => {
      const matchesQuery = !needle || `${message.sender} ${message.subject} ${message.preview}`.toLocaleLowerCase("es").includes(needle);
      const matchesFolder = activeLabel === "sent" ? message.folder === "sent" : activeLabel === "starred" ? message.starred : message.folder !== "sent";
      return matchesQuery && matchesFolder;
    });
  }, [messages, query, activeLabel]);

  return (
    <>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <header className="searchbar">
          <SheetTrigger asChild><button className="icon-button menu-button" type="button" aria-label="Abrir menú"><Menu /></button></SheetTrigger>
          <Search className="search-glyph" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en el correo" aria-label="Buscar en el correo" />
          <button className="account-avatar" type="button" aria-label={`Cuenta de ${mailbox.account.name}`}>{mailbox.account.initial}</button>
        </header>
        <SheetContent side="left" showCloseButton={false} className="gmail-sheet">
          <SheetTitle className="sr-only">Menú de Gmail</SheetTitle><SheetDescription className="sr-only">Carpetas y etiquetas de correo</SheetDescription>
          <DrawerContent active={activeLabel} onSelect={(label) => { setActiveLabel(label); setDrawerOpen(false); }} />
        </SheetContent>
      </Sheet>
      <div className="mail-scroll">
        <h1>{activeName}</h1>
        {!query && activeLabel === "primary" && (
          <div className="categories">
            {mailbox.categories.map((category, index) => (
              <button className="category-row" key={category.id} type="button">
                {index === 0 ? <Tag style={{ color: category.accent }} /> : <Info style={{ color: category.accent }} />}
                <span className="category-copy"><b>{category.label}</b><span>{category.summary}</span></span>
                <em style={{ backgroundColor: category.accent }}>{category.count}</em>
              </button>
            ))}
          </div>
        )}
        <div className="message-list">
          {filtered.map((message) => (
            <button className="message-row" key={message.id} type="button" onClick={() => onOpen(message.id)}>
              <Avatar message={message} />
              <span className="message-copy"><b className={message.read ? "read" : ""}>{message.folder === "sent" && "recipient" in message ? `Para: ${message.recipient}` : message.sender}</b><strong className={message.read ? "read" : ""}>{message.subject}</strong><span>{message.preview}</span></span>
              <span className="message-meta"><time>{message.date}</time><span role="button" tabIndex={0} aria-label={message.starred ? "Quitar destacado" : "Destacar"} onClick={(event) => { event.stopPropagation(); onToggleStar(message.id); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onToggleStar(message.id); } }}><Star className={message.starred ? "starred" : ""} /></span></span>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-state"><MailOpen /><b>No hay correos aquí</b><span>Prueba con otra búsqueda o carpeta.</span></div>}
        </div>
      </div>
      <button className="compose" type="button"><PenLine /><span>Redactar</span></button>
      <nav className="bottom-nav" aria-label="Navegación principal"><button className="active" type="button" aria-label="Correo"><Mail /><i>99+</i></button><button type="button" aria-label="Meet"><Video /></button></nav>
    </>
  );
}

function SenderHeader({ message }: { message: Message }) {
  return (
    <div className="sender-header">
      <Avatar message={message} />
      <div className="sender-lines"><div><b>{message.sender}</b><time>{message.time}</time></div><span>para me <ChevronDown /></span></div>
      <button className="mini-action" type="button" aria-label="Reacción">☺</button><button className="mini-action" type="button" aria-label="Responder"><Reply /></button><button className="mini-action" type="button" aria-label="Más opciones"><MoreHorizontal /></button>
    </div>
  );
}

function PlainBody({ message }: { message: Message }) {
  return <div className="plain-body">{message.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

function BalanceBody({ message }: { message: Message }) {
  return (
    <div className="rich-email runpod-email">
      <div className="runpod-hero"><span className="cube">◇</span><b>runpod</b><span className="runpod-bot">◡</span></div>
      <div className="runpod-content">{message.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<button type="button">View Balance →</button><hr /><div className="social-circles"><span>in</span><span>♥</span></div><footer>© 2026 Runpod. <u>Manage your email preferences</u></footer></div>
    </div>
  );
}

function ReceiptBody() {
  return (
    <div className="rich-email receipt-email">
      <section className="receipt-intro"><h2>¡Gracias por tu compra!</h2><p>Nota #12059-621613</p><p>Fecha de compra: 19/09/26 - 18:16:54.</p><p>Cliente: <b>CRISTOPHER JARED LOPEZ<br />ARCILA</b></p><p>Atendió: <b>MAAS URRUTIA, MIGUEL ANGEL</b></p></section>
      <section className="receipt-main"><div className="delivery-card"><b>FECHA ESTIMADA DE<br />ENTREGA</b><strong>28/09/26</strong><span>A partir de las 14:00 hrs.</span></div><h3>Resumen de compra</h3><div className="receipt-columns"><b>C.</b><b>SKU</b><b>DESCRIPCIÓN</b><b>PRECIO</b></div></section>
    </div>
  );
}

function SupportThreadBody({ message }: { message: Message }) {
  const entries: SupportThreadEntry[] = "thread" in message ? message.thread : [];
  return (
    <div className="support-thread">
      {entries.map((entry, index) => (
        <article className={`thread-message ${entry.role}`} key={`${entry.date}-${index}`}>
          <header>
            <span className="thread-avatar" style={{ background: entry.avatarColor }}>{entry.avatarText}</span>
            <span className="thread-sender"><b>{entry.sender}</b><small>{entry.email}</small><span>para {entry.recipient} <ChevronDown /></span></span>
            <time>{entry.date}</time>
            <button type="button" aria-label="Responder"><Reply /></button>
            <button type="button" aria-label="Más opciones"><MoreHorizontal /></button>
          </header>
          <p>{entry.text}</p>
        </article>
      ))}
    </div>
  );
}

function DetailView({ message, onBack, onToggleStar }: { message: Message; onBack: () => void; onToggleStar: (id: string) => void }) {
  return (
    <>
      <header className="detail-toolbar"><button type="button" onClick={onBack} aria-label="Volver"><ArrowLeft /></button><span /><button type="button" aria-label="Funciones inteligentes"><Sparkles /></button><button type="button" aria-label="Archivar"><Archive /></button><button type="button" aria-label="Eliminar"><Trash2 /></button><button type="button" aria-label="Marcar como no leído"><Mail /></button><button type="button" aria-label="Más opciones"><MoreHorizontal /></button></header>
      <div className="detail-scroll">
        <div className="subject-row"><h1>{message.subject}</h1><span>{message.folder === "sent" ? "Enviados" : "Recibidos"}</span><button type="button" onClick={() => onToggleStar(message.id)} aria-label={message.starred ? "Quitar destacado" : "Destacar"}><Star className={message.starred ? "starred" : ""} /></button></div>
        {message.kind !== "support-thread" && <SenderHeader message={message} />}
        {message.kind === "balance" ? <BalanceBody message={message} /> : message.kind === "receipt" ? <ReceiptBody /> : message.kind === "support-thread" ? <SupportThreadBody message={message} /> : <PlainBody message={message} />}
      </div>
      <footer className="reply-dock"><button type="button"><Reply /><span>Responder</span></button><button type="button"><Reply className="forward-icon" /><span>Reenviar</span></button><button type="button" aria-label="Reacción">☺</button></footer>
    </>
  );
}

export default function GmailApp() {
  const [messages, setMessages] = useState<Message[]>(() => mailbox.messages);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState("primary");
  const openMessage = useCallback((id: string) => { setMessages((current) => current.map((message) => message.id === id ? { ...message, read: true } : message)); setSelectedId(id); window.history.pushState({ messageId: id }, "", `#mail/${id}`); }, []);
  const closeMessage = useCallback(() => { if (window.location.hash.startsWith("#mail/")) window.history.back(); else setSelectedId(null); }, []);
  const toggleStar = useCallback((id: string) => { setMessages((current) => current.map((message) => message.id === id ? { ...message, starred: !message.starred } : message)); }, []);

  useEffect(() => {
    const syncFromUrl = () => { const id = window.location.hash.startsWith("#mail/") ? decodeURIComponent(window.location.hash.slice(6)) : null; setSelectedId(id && mailbox.messages.some((message) => message.id === id) ? id : null); };
    syncFromUrl(); window.addEventListener("popstate", syncFromUrl); return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    const context = document.modelContext; if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: WebMCPTool) => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    void register({ name: "open_email", title: "Abrir correo", description: "Abre un correo visible usando su identificador.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { const id = (input as { id?: unknown }).id; if (typeof id !== "string" || !mailbox.messages.some((message) => message.id === id)) throw new Error("Correo no encontrado"); openMessage(id); return { id, state: "open" }; } });
    void register({ name: "toggle_email_star", title: "Alternar destacado", description: "Destaca o quita el destacado de un correo por identificador.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { const id = (input as { id?: unknown }).id; if (typeof id !== "string" || !mailbox.messages.some((message) => message.id === id)) throw new Error("Correo no encontrado"); toggleStar(id); return { id, toggled: true }; } });
    return () => lifecycle.abort();
  }, [openMessage, toggleStar]);

  const selected = messages.find((message) => message.id === selectedId) ?? null;
  return <main className="app-stage"><section className="phone" aria-label="Clon de Gmail para iOS">{selected ? <DetailView message={selected} onBack={closeMessage} onToggleStar={toggleStar} /> : <InboxView messages={messages} activeLabel={activeLabel} setActiveLabel={(label) => setActiveLabel(label.id)} onOpen={openMessage} onToggleStar={toggleStar} />}</section></main>;
}

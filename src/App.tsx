import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity, ArrowDownLeft, ArrowUpRight, BatteryCharging, Bell, Bluetooth,
  Check, ChevronDown, CircleHelp, Clock3, Command, ContactRound, Delete,
  Download, Headphones, History, Languages, LayoutDashboard,
  LockKeyhole, MessageCircle, MoreHorizontal, Phone, PhoneCall, Plus, Search,
  Send, Settings, ShieldCheck, Signal, Smartphone, Sparkles, Star, Sun, Volume2,
  Wifi, X,
} from 'lucide-react'

type Page = 'home' | 'calls' | 'contacts' | 'messages' | 'notifications' | 'settings'
type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number }>

interface Contact {
  id: number
  name: string
  initials: string
  color: string
  number: string
  subtitle: string
  favorite: boolean
}

interface ChatMessage {
  id: number
  text: string
  time: string
  sent: boolean
}

const initialContacts: Contact[] = [
  { id: 1, name: 'Camille Laurent', initials: 'CL', color: 'coral', number: '+33 6 12 48 73 90', subtitle: 'Mobile · disponible', favorite: true },
  { id: 2, name: 'Alex Morgan', initials: 'AM', color: 'blue', number: '+33 6 52 04 18 26', subtitle: 'Mobile', favorite: true },
  { id: 3, name: 'Léa Bernard', initials: 'LB', color: 'lilac', number: '+33 7 81 29 43 11', subtitle: 'Mobile', favorite: false },
  { id: 4, name: 'Noah Petit', initials: 'NP', color: 'green', number: '+33 6 77 20 65 04', subtitle: 'Mobile', favorite: false },
  { id: 5, name: 'Emma Dubois', initials: 'ED', color: 'gold', number: '+33 6 39 82 15 67', subtitle: 'Mobile', favorite: true },
]

const initialMessages: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, text: 'Tu as vu les photos du week-end ?', time: '10:42', sent: false },
    { id: 2, text: 'Oui, elles sont magnifiques ! ☀️', time: '10:44', sent: true },
    { id: 3, text: 'Je te les envoie en meilleure qualité ce soir.', time: '10:46', sent: false },
  ],
  2: [
    { id: 1, text: 'On se retrouve au café vers 14 h ?', time: 'Hier', sent: false },
    { id: 2, text: 'Parfait, à tout à l’heure !', time: 'Hier', sent: true },
  ],
  3: [{ id: 1, text: 'Merci pour ton aide, c’était top !', time: 'Lun.', sent: false }],
}

const navItems: { id: Page; label: string; icon: IconComponent }[] = [
  { id: 'home', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'calls', label: 'Appels', icon: Phone },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'contacts', label: 'Contacts', icon: ContactRound },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const calls = [
  { name: 'Camille Laurent', time: 'Aujourd’hui · 10:42', duration: '12 min 08 s', type: 'incoming' },
  { name: 'Alex Morgan', time: 'Aujourd’hui · 09:18', duration: '4 min 32 s', type: 'outgoing' },
  { name: 'Numéro inconnu', time: 'Hier · 18:03', duration: 'Manqué', type: 'missed' },
]

const notifications = [
  { app: 'Messages', title: 'Camille Laurent', text: 'Je te les envoie en meilleure qualité ce soir.', time: 'Il y a 4 min', color: 'coral' },
  { app: 'Calendrier', title: 'Rendez-vous dans 30 minutes', text: 'Présentation du projet · 14:00', time: 'Il y a 20 min', color: 'blue' },
  { app: 'Musique', title: 'En lecture', text: 'Midnight City · M83', time: 'Il y a 1 h', color: 'lilac' },
]

const pageTitles: Record<Page, string> = {
  home: 'Vue d’ensemble', calls: 'Appels', contacts: 'Contacts', messages: 'Messages',
  notifications: 'Notifications', settings: 'Paramètres',
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [contacts, setContacts] = useState(initialContacts)
  const [chatMessages, setChatMessages] = useState(initialMessages)
  const [activeChat, setActiveChat] = useState(1)
  const [search, setSearch] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [dialed, setDialed] = useState('')
  const [callTab, setCallTab] = useState<'dialer' | 'history'>('dialer')
  const [notice, setNotice] = useState('')
  const [showPair, setShowPair] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantText, setAssistantText] = useState('')
  const [lightMode, setLightMode] = useState(false)
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [autoStart, setAutoStart] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const activeContact = contacts.find((contact) => contact.id === activeChat) ?? contacts[0]
  const filteredContacts = useMemo(
    () => contacts.filter((contact) => `${contact.name} ${contact.number}`.toLowerCase().includes(search.toLowerCase())),
    [contacts, search],
  )
  const filteredChats = contacts.filter((contact) =>
    `${contact.name} ${chatMessages[contact.id]?.map((message) => message.text).join(' ') ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setShowPair(false)
        setShowAssistant(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    const onDemoCall = (event: Event) => setNotice(`Appel de démonstration vers ${(event as CustomEvent<string>).detail}. Aucun appel n’a été passé.`)
    const onDemoNotice = (event: Event) => setNotice((event as CustomEvent<string>).detail)
    const onChatFilter = (event: Event) => setSearch((event as CustomEvent<string>).detail)
    window.addEventListener('duckphone:demo-call', onDemoCall)
    window.addEventListener('duckphone:demo-notice', onDemoNotice)
    window.addEventListener('duckphone:chat-filter', onChatFilter)
    return () => {
      window.removeEventListener('duckphone:demo-call', onDemoCall)
      window.removeEventListener('duckphone:demo-notice', onDemoNotice)
      window.removeEventListener('duckphone:chat-filter', onChatFilter)
    }
  }, [])

  async function discoverBluetooth() {
    type BluetoothWindow = Window & {
      navigator: Navigator & { bluetooth?: { requestDevice: (options: { acceptAllDevices: boolean }) => Promise<{ name?: string }> } }
    }
    try {
      const bluetooth = (window as BluetoothWindow).navigator.bluetooth
      if (!bluetooth) {
        setNotice('Découverte BLE indisponible dans cet environnement. Les profils téléphoniques nécessitent une intégration native distincte.')
        return
      }
      const device = await bluetooth.requestDevice({ acceptAllDevices: true })
      setNotice(`${device.name || 'Appareil'} détecté en BLE. L’appairage ne donne pas accès aux appels, SMS ou contacts.`)
    } catch (error) {
      const message = error instanceof Error && error.name === 'NotFoundError'
        ? 'Aucun appareil sélectionné.'
        : 'La découverte Bluetooth a été annulée ou refusée.'
      setNotice(message)
    }
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = messageDraft.trim()
    if (!text) return
    const message: ChatMessage = {
      id: Date.now(), text, time: new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date()), sent: true,
    }
    setChatMessages((current) => ({ ...current, [activeChat]: [...(current[activeChat] ?? []), message] }))
    setMessageDraft('')
    setNotice('Message ajouté à la conversation de démonstration. Aucun SMS n’a été envoyé.')
  }

  function dial(number = dialed) {
    if (!number.trim()) {
      setNotice('Saisissez un numéro pour lancer un appel de démonstration.')
      return
    }
    setNotice(`Appel de démonstration vers ${number}. Aucun appel téléphonique n’a été passé.`)
  }

  function toggleFavorite(contactId: number) {
    setContacts((current) => current.map((contact) => contact.id === contactId ? { ...contact, favorite: !contact.favorite } : contact))
  }

  function runAssistant(prompt: string) {
    const normalized = prompt.toLowerCase()
    const result = normalized.includes('résum') || normalized.includes('resume')
      ? `Conversation avec ${activeContact.name} : ${chatMessages[activeChat]?.length ?? 0} messages visibles. Le dernier message reçu parle d’un envoi de photos ce soir.`
      : normalized.includes('cherch')
        ? `Recherche locale : ${filteredChats.length} conversations correspondent à « ${search || 'votre recherche'} ».`
        : 'DuckAI fonctionne ici sur les données de démonstration locales. La connexion à un service d’IA externe est désactivée.'
    setAssistantText(result)
  }

  return (
    <div className={`app-shell${lightMode ? ' light-mode' : ''}`}>
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('home')} aria-label="DuckPhone, accueil">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">duck<span>phone</span><small>DESKTOP COMPANION</small></span>
        </button>

        <div className="device-card">
          <div className="device-topline"><span className="live-dot" /> APPAREIL DE DÉMO</div>
          <div className="device-row">
            <div className="device-glyph"><Smartphone size={19} /></div>
            <div className="device-copy"><strong>Pixel 9 Pro</strong><span>État simulé · hors ligne</span></div>
            <button className="icon-button device-menu" onClick={() => setShowPair(true)} aria-label="Gérer l’appareil"><MoreHorizontal size={18} /></button>
          </div>
          <div className="device-meta"><span><BatteryCharging size={13} /> 82%</span><span><Wifi size={13} /> 5G</span></div>
        </div>

        <div className="nav-caption">ESPACE PERSONNEL</div>
        <nav className="main-nav" aria-label="Navigation principale">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item${page === id ? ' active' : ''}`} onClick={() => { setPage(id); setSearch('') }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === 'messages' && <span className="nav-count">2</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="local-note"><ShieldCheck size={15} /><span>Données locales<br /><strong>Aucune connexion cloud</strong></span></div>
          <button className={`nav-item${page === 'settings' ? ' active' : ''}`} onClick={() => setPage('settings')}><Settings size={18} /><span>Paramètres</span></button>
          <div className="profile-row"><div className="profile-avatar">D</div><div className="profile-label"><strong>Poste de travail</strong><span>Session locale</span></div><button className="icon-button" aria-label="Options du profil"><MoreHorizontal size={18} /></button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>DuckPhone</span><span className="crumb-slash">/</span><strong>{pageTitles[page]}</strong></div>
          <div className="topbar-actions">
            <label className="global-search"><Search size={16} /><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher" /><kbd><Command size={11} /> K</kbd></label>
            <span className="top-divider" />
            <button className="top-icon" onClick={() => setPage('notifications')} aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="connection-pill"><span className="status-dot" /> Mode démo</div>
          </div>
        </header>

        <div className="content-scroll">
          <AnimatePresence mode="wait">
            <motion.section key={page} className="page-content" initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
              {page === 'home' && <Dashboard onPair={() => setShowPair(true)} onNavigate={setPage} contacts={contacts} />}
              {page === 'calls' && <CallsPage tab={callTab} setTab={setCallTab} dialed={dialed} setDialed={setDialed} onDial={dial} />}
              {page === 'contacts' && <ContactsPage contacts={filteredContacts} onFavorite={toggleFavorite} onCall={(number) => dial(number)} />}
              {page === 'messages' && <MessagesPage contacts={filteredChats} activeContact={activeContact} activeChat={activeChat} setActiveChat={setActiveChat} messages={chatMessages[activeChat] ?? []} draft={messageDraft} setDraft={setMessageDraft} onSend={sendMessage} />}
              {page === 'notifications' && <NotificationsPage onReply={(name) => { setPage('messages'); setNotice(`Conversation avec ${name} ouverte en mode démo.`) }} />}
              {page === 'settings' && <SettingsPage lightMode={lightMode} setLightMode={setLightMode} notificationsOn={notificationsOn} setNotificationsOn={setNotificationsOn} autoStart={autoStart} setAutoStart={setAutoStart} />}
            </motion.section>
          </AnimatePresence>
        </div>

        <button className="assistant-fab" onClick={() => { setShowAssistant(true); runAssistant('résumé') }} aria-label="Ouvrir DuckAI"><Sparkles size={19} /><span>DuckAI</span></button>
      </main>

      <AnimatePresence>
        {notice && <motion.div className="toast" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><InfoIcon /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Fermer"><X size={15} /></button></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {showPair && <Modal title="Ajouter un appareil" onClose={() => setShowPair(false)}><div className="pair-visual"><div className="pair-ring"><Bluetooth size={28} /></div><span className="orbit orbit-one" /><span className="orbit orbit-two" /></div><p className="modal-lead">Découverte Bluetooth à proximité</p><p className="modal-copy">Cette recherche utilise Web Bluetooth lorsqu’il est disponible. Elle ne donne pas accès aux appels, SMS ou contacts du téléphone.</p><button className="button-primary modal-action" onClick={() => { setShowPair(false); void discoverBluetooth() }}><Bluetooth size={16} /> Rechercher des appareils</button><div className="privacy-caption"><LockKeyhole size={13} /> Recherche locale, aucune donnée transmise</div></Modal>}
        {showAssistant && <Modal title="DuckAI" onClose={() => setShowAssistant(false)} assistant><div className="assistant-heading"><div className="ai-mark"><Sparkles size={21} /></div><div><strong>Votre assistant local</strong><span>Réponses basées sur les données affichées</span></div></div><div className="assistant-answer">{assistantText || 'Posez une question sur vos données locales.'}</div><div className="assistant-prompts"><button onClick={() => runAssistant('résume')}>Résumer cette conversation</button><button onClick={() => runAssistant('recherche')}>Résumer la recherche</button></div><div className="privacy-caption"><LockKeyhole size={13} /> Aucun service d’IA externe n’est appelé</div></Modal>}
      </AnimatePresence>
    </div>
  )
}

function InfoIcon() { return <CircleHelp size={17} /> }

function Dashboard({ onPair, onNavigate, contacts }: { onPair: () => void; onNavigate: (page: Page) => void; contacts: Contact[] }) {
  return <>
    <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> VOTRE ESPACE CONNECTÉ</div><h1>Bonjour, <span>Alex.</span></h1><p className="page-subtitle">Tout votre téléphone, au même endroit.</p></div><div className="date-stamp"><span>VENDREDI</span><strong>16 <small>OCT.</small></strong><span>SESSION LOCALE</span></div></div>

    <section className="hero-panel">
      <div className="hero-grid" />
      <div className="hero-copy"><span className="hero-kicker"><span className="pulse-dot" /> APERÇU INTERACTIF</span><h2>Votre téléphone.<br /><em>À portée de bureau.</em></h2><p>Explorez DuckPhone avec un appareil de démonstration. Les données présentées sont fictives et restent sur cet ordinateur.</p><div className="hero-actions"><button className="button-primary" onClick={onPair}><Bluetooth size={16} /> Détecter un appareil</button><button className="button-quiet" onClick={() => onNavigate('settings')}>Voir les paramètres <ChevronDown size={15} className="turn-arrow" /></button></div></div>
      <div className="hero-device-wrap"><div className="hero-halo" /><div className="hero-device"><div className="phone-island" /><div className="phone-screen-top"><span>9:41</span><span><Signal size={11} /><Wifi size={11} /><BatteryCharging size={12} /></span></div><div className="phone-orb"><Smartphone size={34} /></div><div className="phone-greeting">Bonjour, Alex</div><div className="phone-mini-card"><span>Prochaine réunion</span><strong>Design review</strong><small>14:00 · 30 min</small></div><div className="phone-bottom-nav"><span /><span /><span /></div></div><div className="float-tag tag-battery"><BatteryCharging size={15} /><span><strong>82%</strong><small>Batterie</small></span></div><div className="float-tag tag-network"><Signal size={15} /><span><strong>Très bon</strong><small>Signal 5G</small></span></div></div>
      <div className="hero-footer"><span><ShieldCheck size={14} /> Démo locale · appareil non connecté</span><span>BLE DISCOVERY <i className="footer-indicator" /></span></div>
    </section>

    <div className="section-heading"><div><span className="section-index">01</span><h2>En un coup d’œil</h2></div><span className="section-caption">DONNÉES DE DÉMONSTRATION</span></div>
    <div className="metric-grid">
      <MetricCard icon={BatteryCharging} label="Batterie" value="82" unit="%" detail="Donnée simulée" accent="mint" />
      <MetricCard icon={Signal} label="Réseau mobile" value="5G" unit="" detail="Signal simulé · excellent" accent="blue" />
      <MetricCard icon={PhoneCall} label="Appels aujourd’hui" value="2" unit="" detail="1 entrant · 1 sortant" accent="lilac" />
      <MetricCard icon={MessageCircle} label="Messages non lus" value="2" unit="" detail="Dans 2 conversations" accent="gold" />
    </div>

    <div className="dashboard-lower"><section className="surface-panel activity-panel"><div className="panel-heading"><div><span className="panel-overline">VOTRE JOURNÉE</span><h3>Activité récente</h3></div><button className="text-button" onClick={() => onNavigate('calls')}>Tout voir <ArrowUpRight size={14} /></button></div><div className="activity-list"><ActivityRow icon={MessageCircle} color="coral" title="Camille Laurent" detail="Je te les envoie en meilleure qualité ce soir." time="10:46" onClick={() => onNavigate('messages')} /><ActivityRow icon={Phone} color="mint" title="Appel avec Camille" detail="Appel entrant · 12 min 08 s" time="10:42" onClick={() => onNavigate('calls')} /><ActivityRow icon={CalendarIcon} color="blue" title="Prochain rendez-vous" detail="Présentation du projet · 14:00" time="À venir" onClick={() => onNavigate('notifications')} /></div></section>
      <section className="surface-panel favorites-panel"><div className="panel-heading"><div><span className="panel-overline">ACCÈS RAPIDE</span><h3>Favoris</h3></div><button className="text-button" onClick={() => onNavigate('contacts')}>Contacts <ArrowUpRight size={14} /></button></div><div className="favorite-list">{contacts.filter((contact) => contact.favorite).slice(0, 3).map((contact) => <button className="favorite-row" key={contact.id} onClick={() => onNavigate('contacts')}><Avatar contact={contact} /><span className="favorite-name"><strong>{contact.name}</strong><small>{contact.number}</small></span><Phone size={16} /></button>)}</div><button className="add-favorite" onClick={() => onNavigate('contacts')}><Plus size={15} /> Gérer les favoris</button></section></div>
    <div className="footnote"><ShieldCheck size={13} /> Les appels, messages, contacts et indicateurs affichés ici sont des exemples. Ils ne proviennent pas d’un téléphone connecté.</div>
  </>
}

function CalendarIcon({ size = 18 }: { size?: number }) { return <Clock3 size={size} /> }

function MetricCard({ icon: Icon, label, value, unit, detail, accent }: { icon: IconComponent; label: string; value: string; unit: string; detail: string; accent: string }) {
  return <article className="metric-card"><div className={`metric-icon ${accent}`}><Icon size={17} /></div><div className="metric-label">{label}</div><div className="metric-value">{value}<span>{unit}</span></div><div className="metric-detail"><span className={`tiny-status ${accent}`} />{detail}</div></article>
}

function ActivityRow({ icon: Icon, color, title, detail, time, onClick }: { icon: IconComponent; color: string; title: string; detail: string; time: string; onClick: () => void }) {
  return <button className="activity-row" onClick={onClick}><span className={`activity-icon ${color}`}><Icon size={15} /></span><span className="activity-copy"><strong>{title}</strong><small>{detail}</small></span><time>{time}</time></button>
}

function Avatar({ contact, large = false }: { contact: Contact; large?: boolean }) { return <span className={`avatar ${contact.color}${large ? ' avatar-large' : ''}`}>{contact.initials}</span> }

function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="standard-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action}</div>
}

function CallsPage({ tab, setTab, dialed, setDialed, onDial }: { tab: 'dialer' | 'history'; setTab: (tab: 'dialer' | 'history') => void; dialed: string; setDialed: (number: string) => void; onDial: (number?: string) => void }) {
  return <><PageHeading eyebrow="COMMUNICATION" title="Appels" subtitle="Numéroteur et historique local de démonstration." action={<div className="segmented-control"><button className={tab === 'dialer' ? 'selected' : ''} onClick={() => setTab('dialer')}><Phone size={14} /> Numéroteur</button><button className={tab === 'history' ? 'selected' : ''} onClick={() => setTab('history')}><History size={14} /> Historique</button></div>} />
    {tab === 'dialer' ? <div className="calls-layout"><section className="surface-panel dialer-panel"><span className="panel-overline">NOUVEL APPEL · DÉMO</span><div className="dial-display"><input aria-label="Numéro de téléphone" value={dialed} onChange={(event) => setDialed(event.target.value)} placeholder="Saisir un numéro" /><button onClick={() => setDialed(dialed.slice(0, -1))} aria-label="Effacer un chiffre"><Delete size={18} /></button></div><div className="keypad">{['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key, index) => <button key={key} onClick={() => setDialed(`${dialed}${key}`)}><strong>{key}</strong><small>{index === 1 ? 'ABC' : index === 2 ? 'DEF' : index === 3 ? 'GHI' : index === 4 ? 'JKL' : index === 5 ? 'MNO' : index === 6 ? 'PQRS' : index === 7 ? 'TUV' : index === 8 ? 'WXYZ' : ''}</small></button>)}</div><button className="call-button" onClick={() => onDial()}><Phone size={18} /> Appeler</button><p className="call-disclaimer"><ShieldCheck size={13} /> Démonstration uniquement · aucun appel passé</p></section><section className="surface-panel recent-calls"><div className="panel-heading"><div><span className="panel-overline">RÉCEMMENT</span><h3>Appels récents</h3></div><History size={17} className="muted-icon" /></div><CallList /></section></div> : <section className="surface-panel history-panel"><div className="panel-heading"><div><span className="panel-overline">JOURNAL LOCAL</span><h3>Historique des appels</h3></div><span className="demo-chip">DONNÉES EXEMPLE</span></div><CallList detailed /></section>}
  </>
}

function CallList({ detailed = false }: { detailed?: boolean }) {
  return <div className="call-list">{calls.map((call) => <div className="call-row" key={call.name}><span className={`call-type ${call.type}`}>{call.type === 'incoming' ? <ArrowDownLeft size={15} /> : call.type === 'outgoing' ? <ArrowUpRight size={15} /> : <Phone size={14} />}</span><span className="call-info"><strong>{call.name}</strong><small>{call.time}</small></span><span className="call-duration">{call.duration}</span><button className="icon-button call-again" aria-label={`Rappeler ${call.name}`} onClick={() => window.dispatchEvent(new CustomEvent('duckphone:demo-call', { detail: call.name }))}><Phone size={16} /></button>{detailed && <button className="icon-button" aria-label="Plus d’options"><MoreHorizontal size={17} /></button>}</div>)}</div>
}

function ContactsPage({ contacts, onFavorite, onCall }: { contacts: Contact[]; onFavorite: (id: number) => void; onCall: (number: string) => void }) {
  return <><PageHeading eyebrow="CARNET D’ADRESSES" title="Contacts" subtitle={`${contacts.length} contacts dans les données de démonstration.`} action={<button className="button-primary" onClick={() => window.dispatchEvent(new CustomEvent('duckphone:demo-notice', { detail: 'L’ajout de contacts est disponible uniquement dans une future intégration système.' }))}><Plus size={16} /> Ajouter</button>} />
    <section className="surface-panel contacts-panel"><div className="contact-table-head"><span>CONTACT</span><span>NUMÉRO</span><span>STATUT</span><span /></div>{contacts.length ? contacts.map((contact) => <div className="contact-row" key={contact.id}><Avatar contact={contact} /><span className="contact-name"><strong>{contact.name}</strong><small>{contact.subtitle}</small></span><span className="contact-number">{contact.number}</span><span className="contact-status"><span className="tiny-status mint" /> Exemple</span><div className="contact-actions"><button className={`icon-button${contact.favorite ? ' is-favorite' : ''}`} onClick={() => onFavorite(contact.id)} aria-label={contact.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}><Star size={16} fill={contact.favorite ? 'currentColor' : 'none'} /></button><button className="icon-button" onClick={() => onCall(contact.number)} aria-label={`Appeler ${contact.name}`}><Phone size={16} /></button></div></div>) : <div className="empty-state"><Search size={21} /><strong>Aucun contact trouvé</strong><span>Essayez un autre nom ou numéro.</span></div>}</section>
    <div className="footnote"><ShieldCheck size={13} /> Les contacts réels du téléphone ne sont pas accessibles sans intégration système autorisée.</div>
  </>
}

function MessagesPage({ contacts, activeContact, activeChat, setActiveChat, messages, draft, setDraft, onSend }: { contacts: Contact[]; activeContact: Contact; activeChat: number; setActiveChat: (id: number) => void; messages: ChatMessage[]; draft: string; setDraft: (text: string) => void; onSend: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <><PageHeading eyebrow="MESSAGERIE" title="Messages" subtitle="Conversations locales de démonstration, non envoyées par SMS." /><div className="messages-layout surface-panel"><aside className="chat-sidebar"><div className="chat-search"><Search size={15} /><input aria-label="Filtrer les conversations" placeholder="Filtrer" onChange={(event) => window.dispatchEvent(new CustomEvent('duckphone:chat-filter', { detail: event.target.value }))} /></div>{contacts.map((contact) => <button className={`chat-preview${contact.id === activeChat ? ' selected' : ''}`} key={contact.id} onClick={() => setActiveChat(contact.id)}><Avatar contact={contact} /><span className="chat-preview-copy"><strong>{contact.name}</strong><small>{contact.id === activeChat ? messages[messages.length - 1]?.text : 'Conversation récente'}</small></span><span className="chat-time">10:46</span></button>)}{!contacts.length && <span className="chat-empty">Aucune conversation trouvée</span>}</aside><section className="chat-window"><header className="chat-header"><Avatar contact={activeContact} /><div><strong>{activeContact.name}</strong><span><span className="tiny-status mint" /> Conversation de démonstration</span></div><button className="icon-button" aria-label="Options"><MoreHorizontal size={18} /></button></header><div className="chat-date"><span /> AUJOURD’HUI <span /></div><div className="chat-bubbles">{messages.map((message) => <div className={`message-line${message.sent ? ' sent' : ''}`} key={message.id}><div className="message-bubble">{message.text}<time>{message.time}</time></div></div>)}</div><div className="quick-replies"><span>RÉPONSES RAPIDES</span>{['Super !', 'À tout à l’heure', 'Merci 😊'].map((reply) => <button key={reply} onClick={() => setDraft(reply)}>{reply}</button>)}</div><form className="message-composer" onSubmit={onSend}><button type="button" className="icon-button" aria-label="Pièce jointe indisponible" title="Pièces jointes indisponibles en mode démo"><Plus size={19} /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Écrire un message de démonstration…" aria-label="Message" /><button className="send-button" type="submit" aria-label="Ajouter le message"><Send size={16} /></button></form></section></div></>
}

function NotificationsPage({ onReply }: { onReply: (name: string) => void }) {
  const [dismissed, setDismissed] = useState<number[]>([])
  const visible = notifications.filter((_, index) => !dismissed.includes(index))
  return <><PageHeading eyebrow="CENTRE DE NOTIFICATIONS" title="Notifications" subtitle="Alertes Android synchronisées indisponibles dans cette démo." action={<button className="button-secondary" onClick={() => setDismissed(notifications.map((_, index) => index))}><Check size={15} /> Tout effacer</button>} /><section className="surface-panel notification-panel"><div className="panel-heading"><div><span className="panel-overline">AUJOURD’HUI</span><h3>{visible.length} notifications récentes</h3></div><Bell size={17} className="muted-icon" /></div>{visible.length ? <div className="notification-list">{visible.map((item) => { const index = notifications.indexOf(item); return <article className="notification-row" key={item.title}><span className={`notification-app-icon ${item.color}`}>{item.app === 'Messages' ? <MessageCircle size={17} /> : item.app === 'Calendrier' ? <Clock3 size={17} /> : <Headphones size={17} />}</span><div className="notification-copy"><div><strong>{item.title}</strong><span>{item.app} · {item.time}</span></div><p>{item.text}</p>{item.app === 'Messages' && <button className="text-button" onClick={() => onReply(item.title)}>Répondre <ArrowUpRight size={14} /></button>}</div><button className="icon-button dismiss-button" onClick={() => setDismissed((current) => [...current, index])} aria-label="Supprimer la notification"><X size={16} /></button></article> })}</div> : <div className="empty-state"><Bell size={22} /><strong>Tout est à jour</strong><span>Aucune notification restante.</span></div>}</section><div className="footnote"><ShieldCheck size={13} /> Ces notifications sont des exemples locaux, pas un miroir du téléphone.</div></>
}

function SettingsPage({ lightMode, setLightMode, notificationsOn, setNotificationsOn, autoStart, setAutoStart }: { lightMode: boolean; setLightMode: (value: boolean) => void; notificationsOn: boolean; setNotificationsOn: (value: boolean) => void; autoStart: boolean; setAutoStart: (value: boolean) => void }) {
  return <><PageHeading eyebrow="PRÉFÉRENCES" title="Paramètres" subtitle="Personnalisez votre espace DuckPhone." /><div className="settings-grid"><section className="surface-panel settings-panel"><div className="panel-heading"><div><span className="panel-overline">APPARENCE</span><h3>Interface</h3></div><Sun size={17} className="muted-icon" /></div><SettingRow icon={Sun} title="Thème clair" description="Choisissez une apparence plus lumineuse."><Toggle checked={lightMode} onChange={setLightMode} /></SettingRow><SettingRow icon={Languages} title="Langue" description="Langue de l’interface."><select aria-label="Langue de l’interface" defaultValue="fr"><option value="fr">Français</option><option value="en">English</option></select></SettingRow><SettingRow icon={Volume2} title="Volume de l’interface" description="Niveau sonore de la démonstration."><input className="volume-slider" type="range" min="0" max="100" defaultValue="68" /></SettingRow></section><section className="surface-panel settings-panel"><div className="panel-heading"><div><span className="panel-overline">COMPORTEMENT</span><h3>Préférences</h3></div><Settings size={17} className="muted-icon" /></div><SettingRow icon={Bell} title="Notifications de bureau" description="Autorisations système requises pour les alertes."><Toggle checked={notificationsOn} onChange={setNotificationsOn} /></SettingRow><SettingRow icon={Download} title="Lancer au démarrage" description="Disponible après installation sous Windows."><Toggle checked={autoStart} onChange={setAutoStart} /></SettingRow><SettingRow icon={LockKeyhole} title="Données personnelles" description="Les données de démonstration restent locales."><span className="settings-badge"><ShieldCheck size={13} /> Local</span></SettingRow></section><section className="surface-panel settings-panel devices-settings"><div className="panel-heading"><div><span className="panel-overline">APPAREILS</span><h3>Appareils enregistrés</h3></div><button className="icon-button" aria-label="Ajouter un appareil"><Plus size={17} /></button></div><div className="saved-device"><div className="device-glyph"><Smartphone size={18} /></div><div><strong>Pixel 9 Pro</strong><span>Appareil exemple · non appairé</span></div><span className="device-status-text">DÉMO</span><button className="icon-button" aria-label="Options appareil"><MoreHorizontal size={17} /></button></div><div className="settings-disclaimer"><Activity size={15} /><span>Les capacités réelles dépendent des API documentées de votre système et du téléphone.</span></div></section></div></>
}

function SettingRow({ icon: Icon, title, description, children }: { icon: IconComponent; title: string; description: string; children: React.ReactNode }) { return <div className="setting-row"><span className="setting-icon"><Icon size={16} /></span><div className="setting-copy"><strong>{title}</strong><span>{description}</span></div><div className="setting-control">{children}</div></div> }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) { return <button className={`toggle${checked ? ' checked' : ''}`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}><span /></button> }

function Modal({ title, onClose, children, assistant = false }: { title: string; onClose: () => void; children: React.ReactNode; assistant?: boolean }) {
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><motion.section className={`modal${assistant ? ' assistant-modal' : ''}`} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }} role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><div><span className="modal-overline">DUCKPHONE · {assistant ? 'IA LOCALE' : 'CONNEXION'}</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></header>{children}</motion.section></motion.div>
}
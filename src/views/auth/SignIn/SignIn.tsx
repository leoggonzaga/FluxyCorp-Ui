import SignInForm from './SignInForm'

/* ── Topographic decoration ─────────────────────────────────── */
const Topo = () => (
    <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-100"
        viewBox="0 0 480 640"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <ellipse cx="80"  cy="560" rx="260" ry="200" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />
        <ellipse cx="80"  cy="560" rx="200" ry="150" stroke="white" strokeOpacity="0.09" strokeWidth="1.2" />
        <ellipse cx="80"  cy="560" rx="145" ry="106" stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="80"  cy="560" rx="96"  ry="68"  stroke="white" strokeOpacity="0.11" strokeWidth="1.2" />
        <ellipse cx="80"  cy="560" rx="56"  ry="38"  stroke="white" strokeOpacity="0.12" strokeWidth="1.2" />

        <ellipse cx="400" cy="90"  rx="210" ry="165" stroke="white" strokeOpacity="0.07" strokeWidth="1.5" />
        <ellipse cx="400" cy="90"  rx="160" ry="120" stroke="white" strokeOpacity="0.08" strokeWidth="1.2" />
        <ellipse cx="400" cy="90"  rx="114" ry="82"  stroke="white" strokeOpacity="0.09" strokeWidth="1.2" />
        <ellipse cx="400" cy="90"  rx="72"  ry="50"  stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />

        <ellipse cx="220" cy="320" rx="120" ry="88"  stroke="white" strokeOpacity="0.05" strokeWidth="1" />
        <ellipse cx="220" cy="320" rx="80"  ry="56"  stroke="white" strokeOpacity="0.06" strokeWidth="1" />
        <ellipse cx="220" cy="320" rx="46"  ry="30"  stroke="white" strokeOpacity="0.07" strokeWidth="1" />
    </svg>
)

/* ── Floating geometric decorations ─────────────────────────── */
const PlusIcon = ({ x, y, size = 14, op = 0.35 }: { x: string; y: string; size?: number; op?: number }) => (
    <div className="absolute pointer-events-none select-none" style={{ left: x, top: y, opacity: op }}>
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </div>
)

const RingIcon = ({ x, y, size = 12, op = 0.22 }: { x: string; y: string; size?: number; op?: number }) => (
    <div className="absolute pointer-events-none select-none" style={{ left: x, top: y, opacity: op }}>
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.5" />
        </svg>
    </div>
)

const Dots = ({ x, y, op = 0.22 }: { x: string; y: string; op?: number }) => (
    <div
        className="absolute pointer-events-none select-none"
        style={{ left: x, top: y, opacity: op, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}
    >
        {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'white' }} />
        ))}
    </div>
)

/* ── Main component ──────────────────────────────────────────── */
const SignIn = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #ede9f8 0%, #e4dff5 55%, #ddd6f3 100%)',
            }}
        >
            {/* ── Card ── */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 880,
                    minHeight: 520,
                    display: 'flex',
                    borderRadius: 28,
                    overflow: 'hidden',
                    boxShadow: '0 32px 80px -12px rgba(109,40,217,0.25), 0 8px 20px -8px rgba(0,0,0,0.10)',
                }}
            >
                {/* ── Left panel ── */}
                <div
                    className="hidden lg:flex"
                    style={{
                        flex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(148deg, #9333ea 0%, #7c3aed 40%, #6d28d9 80%, #5b21b6 100%)',
                        padding: '48px 44px',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Topo />

                    <PlusIcon  x="12%"  y="7%"   size={18} op={0.50} />
                    <PlusIcon  x="74%"  y="12%"  size={13} op={0.32} />
                    <PlusIcon  x="18%"  y="55%"  size={11} op={0.24} />
                    <PlusIcon  x="58%"  y="68%"  size={10} op={0.20} />
                    <RingIcon  x="64%"  y="48%"  size={16} op={0.28} />
                    <RingIcon  x="8%"   y="36%"  size={11} op={0.20} />
                    <RingIcon  x="82%"  y="32%"  size={9}  op={0.18} />
                    <Dots      x="68%"  y="6%"   op={0.28} />
                    <Dots      x="6%"   y="72%"  op={0.18} />

                    {/* ── Brand mark ── */}
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                marginBottom: 24,
                                border: '1px solid rgba(255,255,255,0.20)',
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h2
                            style={{
                                color: 'white',
                                fontSize: 30,
                                fontWeight: 900,
                                lineHeight: 1.2,
                                marginBottom: 10,
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Bem-vindo<br />de volta!
                        </h2>
                        <p
                            style={{
                                color: 'rgba(255,255,255,0.60)',
                                fontSize: 14,
                                lineHeight: 1.7,
                                maxWidth: 220,
                            }}
                        >
                            Acesse a plataforma com as suas credenciais.
                        </p>
                    </div>
                </div>

                {/* ── Right panel (form) ── */}
                <div
                    style={{
                        width: '100%',
                        maxWidth: 420,
                        flexShrink: 0,
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '52px 44px',
                    }}
                    className="w-full lg:max-w-[420px]"
                >
                    <div style={{ marginBottom: 32 }}>
                        <h3
                            style={{
                                fontSize: 24,
                                fontWeight: 900,
                                color: '#111827',
                                marginBottom: 6,
                                letterSpacing: '-0.3px',
                            }}
                        >
                            Entrar
                        </h3>
                        <p style={{ fontSize: 13, color: '#9ca3af' }}>
                            Entre na sua conta para continuar.
                        </p>
                    </div>

                    <SignInForm disableSubmit={false} />
                </div>
            </div>
        </div>
    )
}

export default SignIn

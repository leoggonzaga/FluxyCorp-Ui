import SignInForm from './SignInForm'

/* ── Linhas topográficas em SVG (decoração painel esquerdo) ─── */
const TopoLines = () => (
    <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 480"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Blob grande inferior esquerdo */}
        <ellipse cx="60" cy="420" rx="200" ry="160" stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="60" cy="420" rx="160" ry="120" stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="60" cy="420" rx="120" ry="85"  stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="60" cy="420" rx="85"  ry="58"  stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="60" cy="420" rx="54"  ry="36"  stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        {/* Blob médio superior direito */}
        <ellipse cx="340" cy="80"  rx="170" ry="130" stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="340" cy="80"  rx="130" ry="96"  stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="340" cy="80"  rx="95"  ry="68"  stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        <ellipse cx="340" cy="80"  rx="64"  ry="44"  stroke="white" strokeOpacity="0.10" strokeWidth="1.2" />
        {/* Blob pequeno centro */}
        <ellipse cx="180" cy="250" rx="110" ry="80"  stroke="white" strokeOpacity="0.07" strokeWidth="1" />
        <ellipse cx="180" cy="250" rx="75"  ry="52"  stroke="white" strokeOpacity="0.07" strokeWidth="1" />
        <ellipse cx="180" cy="250" rx="44"  ry="30"  stroke="white" strokeOpacity="0.07" strokeWidth="1" />
    </svg>
)

/* ── Elementos geométricos flutuantes ────────────────────────── */
const DecorPlus = ({ x, y, size = 14, opacity = 0.35 }: { x: string; y: string; size?: number; opacity?: number }) => (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, opacity }}>
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    </div>
)

const DecorCircle = ({ x, y, size = 12, opacity = 0.25 }: { x: string; y: string; size?: number; opacity?: number }) => (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, opacity }}>
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.5" />
        </svg>
    </div>
)

const DecorDots = ({ x, y, opacity = 0.25 }: { x: string; y: string; opacity?: number }) => (
    <div className="absolute pointer-events-none grid grid-cols-4 gap-[5px]" style={{ left: x, top: y, opacity }}>
        {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />
        ))}
    </div>
)

const SignIn = () => {
    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'linear-gradient(135deg, #ede9f8 0%, #e4dff5 50%, #ddd6f3 100%)' }}
        >
            {/* Card */}
            <div
                className="w-full flex overflow-hidden rounded-3xl shadow-2xl shadow-purple-900/20 max-w-4xl"
                style={{ minHeight: 500 }}
            >
                {/* ── Painel esquerdo — decorativo ── */}
                <div
                    className="hidden lg:flex flex-col justify-between relative overflow-hidden flex-1 p-10"
                    style={{ background: 'linear-gradient(145deg, #8b5cf6 0%, #7c3aed 45%, #6d28d9 100%)' }}
                >
                    <TopoLines />
                    <DecorPlus   x="14%"  y="8%"  size={16} opacity={0.45} />
                    <DecorPlus   x="72%"  y="14%" size={12} opacity={0.30} />
                    <DecorPlus   x="20%"  y="58%" size={11} opacity={0.25} />
                    <DecorCircle x="62%"  y="52%" size={14} opacity={0.30} />
                    <DecorCircle x="10%"  y="38%" size={10} opacity={0.20} />
                    <DecorDots   x="66%"  y="7%"  opacity={0.30} />

                    <div className="relative z-10 mt-auto">
                        <h2 className="text-3xl font-black text-white leading-tight mb-3">
                            Bem-vindo de volta!
                        </h2>
                        <p className="text-white/60 text-[15px] leading-relaxed max-w-[220px]">
                            Acesse a plataforma com as suas credenciais.
                        </p>
                    </div>
                </div>

                {/* ── Painel direito — Formulário ── */}
                <div className="flex flex-col justify-center w-full lg:w-[400px] flex-shrink-0 bg-white px-10 sm:px-12 py-12 lg:py-0">

                    {/* Título */}
                    <div className="mb-7 text-center lg:text-left">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight mb-1">
                            Sign In
                        </h3>
                        <p className="text-sm text-gray-400">Entre na sua conta para continuar.</p>
                    </div>

                    <SignInForm disableSubmit={false} />

                </div>
            </div>
        </div>
    )
}

export default SignIn

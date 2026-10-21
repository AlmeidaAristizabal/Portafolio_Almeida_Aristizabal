// El camión de AJ Express dibujado en SVG (del v9): llantas que giran, rebote, carretera, humo y luz.
// Los colores van en style porque var() no funciona como atributo de SVG.
const c = (color: string) => ({ fill: `var(--color-${color})` });

function Llanta({ cx }: { cx: number }) {
  // Los 5 tornillitos alrededor del centro
  const tornillos = [[13, 0], [4, 12.4], [-10.5, 7.6], [-10.5, -7.6], [4, -12.4]];
  return (
    <g className="aj-llanta">
      <circle cx={cx} cy="288" r="34" style={c('gr-600')} />
      <circle cx={cx} cy="288" r="20" style={c('pu-100')} />
      <circle cx={cx} cy="288" r="7" style={c('pu-600')} />
      {tornillos.map(([dx, dy]) => (
        <circle key={`${dx},${dy}`} cx={cx + dx} cy={288 + dy} r="2.6" style={c('pu-600')} />
      ))}
    </g>
  );
}

export function CamionAJ({ etiqueta = 'Camión de AJ Express rumbo a producción' }: { etiqueta?: string }) {
  return (
    <svg className="aj-camion" viewBox="0 0 720 380" role="img" aria-label={etiqueta}>
      <line x1="0" y1="322" x2="720" y2="322" style={{ stroke: 'var(--color-in-100)', strokeWidth: 3, strokeLinecap: 'round' }} />
      <line className="aj-carretera" x1="0" y1="350" x2="720" y2="350" style={{ stroke: 'var(--color-in-200)', strokeOpacity: 0.7, strokeWidth: 4, strokeLinecap: 'round', strokeDasharray: '34 30' }} />
      <ellipse cx="368" cy="322" rx="262" ry="7" style={{ fill: 'var(--color-pu-600)', opacity: 0.1 }} />

      {/* rayitas de velocidad */}
      <g style={{ stroke: 'var(--color-pu-200)', strokeWidth: 4, strokeLinecap: 'round' }}>
        <line className="aj-velocidad" x1="30" y1="122" x2="88" y2="122" />
        <line className="aj-velocidad" x1="8" y1="172" x2="82" y2="172" style={{ animationDelay: '-.3s' }} />
        <line className="aj-velocidad" x1="40" y1="222" x2="92" y2="222" style={{ animationDelay: '-.6s' }} />
      </g>

      {/* humo del exosto */}
      <g style={c('pu-100')}>
        {['0s', '-.4s', '-.8s'].map((retraso) => (
          <circle key={retraso} className="aj-humo" cx="94" cy="270" r="8" style={{ animationDelay: retraso }} />
        ))}
      </g>

      <g className="aj-cuerpo">
        <polygon className="aj-luz" points="624,226 716,200 716,268 624,240" style={c('bl-100')} />
        <rect x="90" y="266" width="24" height="8" rx="4" style={c('in-600')} />
        <path d="M480 74 Q548 76 562 128 L480 128 Z" style={c('pu-500')} />
        <rect x="110" y="70" width="376" height="196" rx="16" style={c('pu-600')} />
        <rect x="126" y="88" width="6" height="160" rx="3" style={c('pu-500')} />
        <rect x="110" y="238" width="376" height="4" style={c('pu-500')} />

        <circle cx="196" cy="168" r="46" style={c('pu-100')} />
        <g transform="translate(150 122) scale(0.92)" style={{ fill: 'none', stroke: 'var(--color-pu-600)', strokeWidth: 8.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <path d="M32 66 L41.6 31 Q44 23 46.4 31 L55 66" />
          <path d="M36.6 51 L50.8 51" />
          <path d="M67 25 L67 67 Q67 80 58 80 Q49.5 80 49.5 73" />
        </g>
        <text x="262" y="182" textLength="176" lengthAdjust="spacingAndGlyphs" style={{ fontFamily: 'var(--font-titulo)', fontWeight: 700, fontSize: 52, letterSpacing: 4, fill: '#fff' }}>
          EXPRESS
        </text>
        <text x="264" y="207" style={{ fontFamily: 'var(--font-titulo)', fontWeight: 600, fontSize: 15, letterSpacing: 2.6, fill: 'var(--color-pu-100)' }}>
          ALMEIDA · ARISTIZABAL
        </text>

        <path d="M486 128 L562 128 Q576 128 584 141 L617 196 Q624 207 624 220 L624 262 Q624 270 616 270 L486 270 Z" style={c('pu-500')} />
        <path d="M500 142 L556 142 Q565 142 570 151 L596 196 L500 196 Z" style={c('in-50')} />
        <path d="M514 150 L530 150 L514 178 Z" style={{ fill: '#fff', opacity: 0.6 }} />
        <path d="M494 206 L558 206 L558 260" style={{ fill: 'none', stroke: 'var(--color-pu-600)', strokeWidth: 2.5, strokeLinecap: 'round' }} />
        <rect x="506" y="216" width="20" height="5" rx="2.5" style={c('pu-100')} />
        <rect x="612" y="224" width="12" height="16" rx="4" style={c('bl-100')} />
        <path d="M604 248 L604 262 M610 248 L610 262 M616 248 L616 262" style={{ fill: 'none', stroke: 'var(--color-pu-600)', strokeWidth: 2.5, strokeLinecap: 'round' }} />
        <rect x="104" y="262" width="390" height="10" rx="5" style={c('in-600')} />
        <rect x="480" y="262" width="152" height="14" rx="7" style={c('in-600')} />
        <path d="M163 290 A42 42 0 0 1 247 290 Z" style={c('in-600')} />
        <path d="M506 290 A42 42 0 0 1 590 290 Z" style={c('in-600')} />
      </g>

      <Llanta cx={205} />
      <Llanta cx={548} />
    </svg>
  );
}

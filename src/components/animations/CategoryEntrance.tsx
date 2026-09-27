import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Flower2, Gift, Cake, PenLine, Leaf, Sparkles, Heart, CalendarClock, Star, Boxes, SkipForward } from 'lucide-react'
import { useMotionSafe } from '../../lib/motion'
import { useIsFirstSessionVisit, markSessionVisit } from '../../lib/hooks'

type AnimKind =
  | 'bouquet' | 'giftbox' | 'cake' | 'personalize' | 'plant'
  | 'sparkle' | 'heart' | 'calendar' | 'star' | 'combo'

interface Props {
  kind: AnimKind
  title: string
  children: React.ReactNode
}

const DURATION = 2600

/** Icon + label chip used across several scenes. */
function Chip({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number | string; className?: string }>; label: string }) {
  return (
    <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 translate-y-[86px]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-lift backdrop-blur"
      >
        <Icon size={16} className="text-rose-600" />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-plum-700">{label}</span>
      </motion.div>
    </div>
  )
}

function Scene({ children }: { children: React.ReactNode }) {
  return <div className="absolute inset-0">{children}</div>
}

// ————— Bouquet assembly —————
function BouquetScene() {
  const petals = useMemo(
    () =>
      Array.from({ length: 11 }).map((_, i) => ({
        x: Math.cos((i / 11) * Math.PI * 2) * 62 + (i % 2 ? 8 : -8),
        y: Math.sin((i / 11) * Math.PI * 2) * 46,
        delay: 0.55 + i * 0.09,
        color: ['#e87494', '#d93f6e', '#b4123f', '#f3a7bb'][i % 4],
        rot: Math.random() * 90 - 45,
      })),
    [],
  )
  return (
    <Scene>
      {/* wrapping cone */}
      <motion.div
        className="absolute left-1/2 top-[38%] h-40 w-40"
        initial={{ opacity: 0, y: -26, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.5 }}
        style={{ x: '-50%', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', background: 'linear-gradient(135deg, #f3d7c8, #e9b8a5)' }}
      />
      {/* stems */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-[46%] h-24 w-[3px] origin-top rounded-full bg-mint-deep/80"
          style={{ rotate: (i - 2) * 7 }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.25 + i * 0.06, duration: 0.4 }}
        />
      ))}
      {/* blooms */}
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-[42%] h-6 w-6 rounded-full"
          style={{ background: p.color, boxShadow: '0 2px 8px rgba(180,18,63,.25)' }}
          initial={{ x: (i % 2 ? 1 : -1) * (140 + i * 12), y: -80, scale: 0.4, opacity: 0 }}
          animate={{ x: p.x - 12, y: p.y - 26, scale: 1, opacity: 1, rotate: p.rot }}
          transition={{ delay: p.delay, type: 'spring', stiffness: 260, damping: 20 }}
        />
      ))}
      {/* ribbon */}
      <motion.div
        className="absolute left-1/2 top-[63%] h-3 w-24 rounded-full bg-rose-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200, damping: 16 }}
        style={{ x: '-50%' }}
      />
      <motion.div
        className="absolute left-1/2 top-[61%]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.62, type: 'spring', stiffness: 260, damping: 12 }}
        style={{ x: '-50%' }}
      >
        <div className="h-4 w-4 rotate-45 bg-rose-700" />
      </motion.div>
      <Chip icon={Flower2} label="Arranging your bouquet" />
    </Scene>
  )
}

// ————— Gift box reveal —————
function GiftBoxScene() {
  return (
    <Scene>
      <motion.div
        className="absolute left-1/2 top-1/2"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ x: '-50%', y: '-50%' }}
      >
        {/* sparkles burst */}
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold-light"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos(angle) * (60 + (i % 3) * 18),
                y: Math.sin(angle) * (46 + (i % 3) * 14),
                opacity: [0, 1, 0],
                scale: [0, 1.4, 0.4],
              }}
              transition={{ delay: 0.7 + i * 0.04, duration: 0.9 }}
            />
          )
        })}
        {/* box base */}
        <motion.div className="relative h-20 w-28 rounded-b-xl bg-rose-700" initial={{ scale: 1 }} animate={{ scale: [1, 0.96, 1] }} transition={{ delay: 0.55, duration: 0.35 }}>
          <div className="absolute inset-x-0 top-0 h-3 w-full bg-rose-800/70" />
          <motion.div className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 bg-gold" initial={{ scaleY: 1 }} />
        </motion.div>
        {/* lid flying off */}
        <motion.div
          className="absolute -top-8 left-1/2 h-6 w-32 -translate-x-1/2 rounded-lg bg-rose-600"
          initial={{ y: 4, rotate: 0 }}
          animate={{ y: -46, rotate: -22, opacity: 0.9 }}
          transition={{ delay: 0.72, type: 'spring', stiffness: 180, damping: 14 }}
        >
          <div className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 bg-gold" />
        </motion.div>
      </motion.div>
      <Chip icon={Gift} label="Unwrapping something special" />
    </Scene>
  )
}

// ————— Cake reveal —————
function CakeScene() {
  return (
    <Scene>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* plate */}
        <motion.div className="h-2.5 w-44 rounded-full bg-plum-200" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }} />
        {/* layers */}
        {[
          { h: 26, c: '#f6e3d7', y: -26, d: 0.18 },
          { h: 22, c: '#f3cfe0', y: -48, d: 0.3 },
          { h: 18, c: '#fdf2f5', y: -66, d: 0.42 },
        ].map((l, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 w-40 origin-bottom rounded-t-lg"
            style={{ x: '-50%', background: l.c, height: l.h, top: l.y }}
            initial={{ scaleY: 0, y: 20 }}
            animate={{ scaleY: 1, y: 0 }}
            transition={{ delay: l.d, type: 'spring', stiffness: 210, damping: 20 }}
          />
        ))}
        {/* candles */}
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="absolute left-1/2" style={{ top: -82, left: 96 + i * 12 }}>
            <motion.div
              className="h-7 w-[5px] rounded-full bg-plum-300"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            />
            <motion.div
              className="absolute -top-3 left-1/2 h-3 w-3 rounded-full bg-gold-light"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.1], opacity: [0, 1, 0.9] }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
              style={{ x: '-50%' }}
            />
          </motion.div>
        ))}
      </div>
      <Chip icon={Cake} label="Lighting the candles" />
    </Scene>
  )
}

// ————— Personalization writing —————
function PersonalizeScene() {
  return (
    <Scene>
      <motion.div
        className="absolute left-1/2 top-1/2 w-64 rounded-2xl border border-plum-100 bg-white p-5 shadow-lift"
        initial={{ opacity: 0, y: 18, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ x: '-50%', y: '-50%' }}
      >
        <p className="eyebrow text-gold">A gift made for you</p>
        <div className="mt-2 font-display text-2xl font-semibold text-plum-900">
          {'For Ayesha'.split('').map((ch, i) => (
            <motion.span key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}>
              {ch === ' ' ? '\u00A0' : ch}
            </motion.span>
          ))}
        </div>
        <motion.div className="mt-3 h-[2px] w-full bg-gradient-to-r from-rose-400 to-gold" initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.9, ease: 'easeInOut' }} />
        <p className="mt-2 text-xs text-plum-400">…with a message only they will understand.</p>
      </motion.div>
      <Chip icon={PenLine} label="Inscribing your message" />
    </Scene>
  )
}

// ————— Plant sprout —————
function PlantScene() {
  return (
    <Scene>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* pot */}
        <motion.div className="h-14 w-20 rounded-b-2xl rounded-t-md bg-[#c96f4a]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} />
        {/* stem + leaves */}
        <motion.div className="absolute bottom-12 left-1/2 h-16 w-[3px] rounded bg-mint-deep" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.35, duration: 0.5 }} style={{ x: '-50%' }} />
        {[-1, 1].map((side) => (
          <motion.div
            key={side}
            className="absolute bottom-[74px] left-1/2 h-3.5 w-9 rounded-full bg-mint"
            style={{ left: `calc(50% + ${side * 4}px)`, transformOrigin: side === 1 ? 'left' : 'right', rotate: side * -28 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 + (side === 1 ? 0.15 : 0), type: 'spring', stiffness: 240, damping: 15 }}
          />
        ))}
        <motion.div className="absolute bottom-[92px] left-1/2 h-5 w-5 rounded-full bg-mint-deep" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, type: 'spring', stiffness: 240, damping: 12 }} style={{ x: '-50%' }} />
      </div>
      <Chip label="Planting something green" icon={Leaf} />
    </Scene>
  )
}

// ————— Sparkle sweep —————
function SparkleScene() {
  const sparkles = useMemo(() => Array.from({ length: 18 }).map((_, i) => ({ x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 0.9, s: 8 + Math.random() * 12 })), [])
  return (
    <Scene>
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-gold-light"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.85], rotate: 180 }}
          transition={{ delay: s.d, duration: 0.8 }}
        >
          <Sparkles size={s.s} />
        </motion.div>
      ))}
      <Chip icon={Sparkles} label="Polishing every detail" />
    </Scene>
  )
}

// ————— Heart flutter —————
function HeartScene() {
  return (
    <Scene>
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 text-rose-400"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: Math.cos(i * 0.7) * (40 + i * 22),
            y: Math.sin(i * 0.7) * (30 + i * 16) - 30,
            scale: 0.8 + (i % 3) * 0.35,
            opacity: [0, 1, 0.9],
          }}
          transition={{ delay: 0.25 + i * 0.11, duration: 0.7, ease: 'easeOut' }}
        >
          <Heart size={16 + (i % 3) * 10} fill="currentColor" />
        </motion.div>
      ))}
      <Chip icon={Heart} label="Sealing it with love" />
    </Scene>
  )
}

// ————— Calendar / same-day —————
function CalendarScene() {
  return (
    <Scene>
      <motion.div
        className="absolute left-1/2 top-1/2 h-32 w-32 overflow-hidden rounded-2xl border-2 border-plum-200 bg-white shadow-lift"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ x: '-50%', y: '-50%' }}
      >
        <div className="h-8 w-full bg-rose-600" />
        <div className="grid grid-cols-7 gap-1 p-2.5">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className={`h-3 w-3 rounded-[4px] ${i === 10 ? 'bg-rose-500' : 'bg-plum-100'}`} />
          ))}
        </div>
        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-gold"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.8, 1], x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
      </motion.div>
      <motion.div className="absolute left-1/2 top-1/2 text-rose-600" initial={{ x: -120, opacity: 0 }} animate={{ x: 90, opacity: [0, 1, 1, 0] }} transition={{ delay: 0.9, duration: 1.2 }} style={{ y: '-50%' }}>
        <CalendarClock size={34} />
      </motion.div>
      <Chip icon={CalendarClock} label="Same-day express lane" />
    </Scene>
  )
}

// ————— Star —————
function StarScene() {
  return (
    <Scene>
      <motion.div className="absolute left-1/2 top-1/2" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} style={{ x: '-50%', y: '-50%' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
          <Star size={64} className="fill-gold text-gold" />
        </motion.div>
      </motion.div>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold-light"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: Math.cos(i / 8 * Math.PI * 2) * 90, y: Math.sin(i / 8 * Math.PI * 2) * 90, opacity: 0 }}
          transition={{ delay: 0.6 + i * 0.05, duration: 1, repeat: Infinity, repeatDelay: 0.4 }}
        />
      ))}
      <Chip icon={Star} label="A shining new addition" />
    </Scene>
  )
}

// ————— Combo stack —————
function ComboScene() {
  const items = [Boxes, Gift, Flower2]
  return (
    <Scene>
      {items.map((Icon, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 items-center justify-center rounded-2xl border border-plum-100 bg-white shadow-lift"
          style={{ x: '-50%', y: '-50%' }}
          initial={{ y: -90, opacity: 0, rotate: -8 }}
          animate={{ y: -8 - i * 54, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.18, type: 'spring', stiffness: 220, damping: 17 }}
        >
          <Icon size={26} className="text-rose-600" />
        </motion.div>
    ))}
      <Chip icon={Boxes} label="Better together" />
    </Scene>
  )
}

const SCENES: Record<AnimKind, React.ComponentType> = {
  bouquet: BouquetScene,
  giftbox: GiftBoxScene,
  cake: CakeScene,
  personalize: PersonalizeScene,
  plant: PlantScene,
  sparkle: SparkleScene,
  heart: HeartScene,
  calendar: CalendarScene,
  star: StarScene,
  combo: ComboScene,
}

/**
 * Full-screen themed entrance when a category is first visited in a session.
 * Skippable, reduced-motion aware, and non-blocking (content renders beneath).
 */
export default function CategoryEntrance({ kind, title, children }: Props) {
  const motionSafe = useMotionSafe()
  const [show, setShow] = useState(false)
  const isFirst = useIsFirstSessionVisit(kind)

  useEffect(() => {
    if (!motionSafe || !isFirst) return
    setShow(true)
    markSessionVisit(kind)
    const t = setTimeout(() => setShow(false), DURATION)
    return () => clearTimeout(t)
  }, [motionSafe, isFirst, kind])

  const Scene = SCENES[kind] ?? SparkleScene

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45 }}
            style={{ background: 'radial-gradient(circle at 50% 40%, #fdf2f5 0%, #f9cfda 45%, #f5eadc 100%)' }}
          >
            <Scene />
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-center">
              <motion.p
                className="font-display text-2xl font-semibold text-plum-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {title}
              </motion.p>
              <motion.button
                onClick={() => setShow(false)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-plum-600 shadow-soft backdrop-blur transition hover:bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <SkipForward size={13} /> Skip intro
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={false} animate={{ opacity: show ? 0.25 : 1 }} transition={{ duration: 0.4 }}>
        {children}
      </motion.div>
    </>
  )
}

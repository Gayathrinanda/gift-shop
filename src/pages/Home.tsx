import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Truck, Leaf, Star, Quote, Clock, Gift } from 'lucide-react'
import { useActiveCategories, toStoreLink } from '../store/categoryStatus'
import { useCatalog } from '../store/products'
import { useBanners } from '../store/merch'
import ProductCard from '../components/ui/ProductCard'
import ProductRow from '../components/ui/ProductRow'
import SmartImage from '../components/ui/SmartImage'
import FadeIn from '../components/animations/FadeIn'
import { Stars } from '../components/ui/Rating'
import { useMotionSafe } from '../lib/motion'

const HERO_SLIDES = [
  {
    eyebrow: 'Fresh this season',
    title: 'Say it with flowers,\nsay it beautifully.',
    sub: 'Hand-tied bouquets from our atelier — cut at dawn, at their door by dusk.',
    cta: 'Shop Flowers',
    link: '/category/flowers',
    image: 'photo-1490750967868-88aa4486c946',
    tone: 'from-rose-600/90 via-rose-600/40',
  },
  {
    eyebrow: 'Baked before sunrise',
    title: 'Cakes worth\ncancelling diets for.',
    sub: 'Belgian truffle, rose-pistachio & burnt Basque — from artisan bakeries we adore.',
    cta: 'Explore Cakes',
    link: '/category/cakes',
    image: 'photo-1578985545062-69928b1d9587',
    tone: 'from-plum-800/90 via-plum-800/40',
  },
  {
    eyebrow: 'Curated abundance',
    title: 'One hamper.\nA thousand thank-yous.',
    sub: 'Gourmet trays, candles and keepsakes, layered like only MemoriesCatcher can.',
    cta: 'View Hampers',
    link: '/category/hampers',
    image: 'photo-1513885535751-8b9238bd345a',
    tone: 'from-gold-deep/90 via-gold-deep/40',
  },
]

function Hero() {
  const [idx, setIdx] = useState(0)
  const motionSafe = useMotionSafe()
  const next = useCallback(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), [])
  const prev = () => setIdx((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)

  useEffect(() => {
    if (!motionSafe) return
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [next, motionSafe])

  const slide = HERO_SLIDES[idx]

  return (
    <section className="relative overflow-hidden bg-plum-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={motionSafe ? { opacity: 0, scale: 1.04 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[540px] md:min-h-[600px]"
        >
          <div className="absolute inset-0">
            <img
              src={`https://images.unsplash.com/${slide.image}?auto=format&fit=crop&w=1600&q=80`}
              alt=""
              className="h-full w-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.tone} to-transparent`} />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/60 via-transparent to-transparent" />
          </div>

          <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-center px-6 md:min-h-[600px]">
            <div className="max-w-xl py-16">
              <motion.p
                className="eyebrow flex items-center gap-2 text-gold-light"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Sparkles size={14} /> {slide.eyebrow}
              </motion.p>
              <motion.h1
                className="mt-4 whitespace-pre-line font-display text-4xl font-bold leading-[1.06] text-white md:text-6xl"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p
                className="mt-4 max-w-md text-base leading-relaxed text-white/85"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {slide.sub}
              </motion.p>
              <motion.div
                className="mt-8 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Link to={toStoreLink(slide.link)} className="btn bg-white px-7 py-3 text-plum-900 shadow-lift hover:bg-rose-50">
                  {slide.cta} <ArrowRight size={16} />
                </Link>
                <Link to="/shop" className="btn border border-white/40 px-7 py-3 text-white backdrop-blur transition hover:bg-white/10">
                  Browse all gifts
                </Link>
              </motion.div>
            </div>
          </div>

          {/* controls */}
          <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
            <button onClick={prev} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/15">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/15">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="absolute bottom-8 left-6 z-10 flex gap-1.5 md:left-[max(1.5rem,calc(50%-42rem))]">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-8 bg-gold-light' : 'w-3 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

function SectionHeading({ eyebrow, title, sub, link, linkLabel }: { eyebrow: string; title: string; sub?: string; link?: string; linkLabel?: string }) {
  return (
    <FadeIn className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow text-rose-600">{eyebrow}</p>
        <h2 className="heading-lg mt-1 text-plum-900">{title}</h2>
        {sub && <p className="mt-2 max-w-xl text-sm text-plum-500">{sub}</p>}
      </div>
      {link && (
        <Link to={toStoreLink(link)} className="group flex items-center gap-1.5 text-sm font-bold text-rose-700 hover:text-rose-800">
          {linkLabel ?? 'View all'}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </FadeIn>
  )
}

const OCCASIONS = [
  { name: 'Birthday', icon: '🎂', link: '/category/birthday', tone: 'from-rose-100 to-rose-50' },
  { name: 'Anniversary', icon: '💖', link: '/category/anniversary', tone: 'from-rose-100 to-white' },
  { name: 'Love & Romance', icon: '🌹', link: '/category/flowers', tone: 'from-rose-100 to-rose-50' },
  { name: 'Thank You', icon: '🙏', link: '/category/hampers', tone: 'from-amber-100 to-amber-50' },
  { name: 'Congratulations', icon: '🎉', link: '/category/combos', tone: 'from-emerald-100 to-emerald-50' },
  { name: 'Wedding', icon: '💍', link: '/category/wedding', tone: 'from-violet-100 to-violet-50' },
  { name: 'Festivals', icon: '🪔', link: '/category/hampers', tone: 'from-orange-100 to-amber-50' },
  { name: 'Corporate Gifting', icon: '💼', link: '/category/corporate', tone: 'from-sky-100 to-sky-50' },
]

export default function Home() {
  const products = useCatalog((s) => s.products)
  const banners = useBanners((s) => s.banners).filter((b) => b.active).sort((a, b) => a.order - b.order)
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 8)
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 8)
  const trending = products.filter((p) => p.featured && !p.bestSeller).slice(0, 8)
  const activeCategories = useActiveCategories()
  const categories = activeCategories.slice(0, 6)

  return (
    <div>
      <Hero />

      {/* USP strip */}
      <section className="border-b border-plum-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4">
          {[
            { icon: Truck, t: 'Same-day delivery', s: 'Order by 6 PM in metros' },
            { icon: Leaf, t: 'Farm-fresh flowers', s: 'Cut this morning, not last week' },
            { icon: Clock, t: '2-hour express slot', s: 'On select gifts today' },
            { icon: Star, t: '4.8 / 5 by 12k gifters', s: 'Demo rating, real pride' },
          ].map((u, i) => (
            <FadeIn key={u.t} delay={i * 0.06} className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <u.icon size={19} />
              </span>
              <span>
                <span className="block text-sm font-bold text-plum-900">{u.t}</span>
                <span className="block text-xs text-plum-400">{u.s}</span>
              </span>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeading
          eyebrow="Shop by category"
          title="A little world of gifts"
          sub="Every category has its own personality — and its own welcome animation. Go on, peek."
          link="/shop"
          linkLabel="All products"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <FadeIn key={c.slug} delay={i * 0.05}>
              <Link
                to={`/category/${c.slug}`}
                className="group block overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <div className="relative aspect-[4/4.6] overflow-hidden">
                  <SmartImage src={c.image} alt={c.name} className="h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-3 bottom-3">
                    <p className="font-display text-base font-bold text-white">{c.name}</p>
                    <p className="text-[11px] text-white/75">{c.tagline}</p>
                  </div>
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Most loved" title="Best sellers, week after week" link="/category/best-sellers" linkLabel="See all best sellers" />
          <ProductRow products={bestSellers} />
        </div>
      </section>

      {/* Occasions */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeading eyebrow="Shop by occasion" title="What are we celebrating?" sub="Eight moods, one perfect gift for each." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {OCCASIONS.map((o, i) => (
            <FadeIn key={o.name} delay={i * 0.04}>
              <Link
                to={toStoreLink(o.link)}
                className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-br ${o.tone} p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift`}
              >
                <span className="text-2xl transition-transform duration-300 group-hover:scale-125">{o.icon}</span>
                <span className="text-sm font-bold text-plum-800">{o.name}</span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Promo banners (admin-managed) */}
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-4 md:grid-cols-2">
          {banners.slice(0, 4).map((b, i) => (
            <FadeIn key={b.id} delay={i * 0.06}>
              <Link
                to={toStoreLink(b.link)}
                className={`group relative flex h-52 items-center overflow-hidden rounded-3xl p-8 shadow-soft transition hover:shadow-lift ${
                  b.tone === 'rose' ? 'bg-gradient-to-br from-rose-600 to-rose-800' :
                  b.tone === 'plum' ? 'bg-gradient-to-br from-plum-700 to-plum-900' :
                  b.tone === 'gold' ? 'bg-gradient-to-br from-gold to-gold-deep' :
                  b.tone === 'mint' ? 'bg-gradient-to-br from-mint to-mint-deep' : 'bg-gradient-to-br from-rose-400 to-rose-600'
                }`}
              >
                <div className="relative z-10 max-w-[70%]">
                  <p className="eyebrow text-white/70">MemoriesCatcher special</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-white">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-white/85">{b.subtitle}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-bold text-plum-900 transition group-hover:gap-3">
                    {b.cta} <ArrowRight size={13} />
                  </span>
                </div>
                <Gift size={120} className="absolute -bottom-6 -right-4 text-white/15 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Just landed" title="New arrivals" link="/category/new-arrivals" linkLabel="See all new arrivals" />
          <ProductRow products={newArrivals} />
        </div>
      </section>

      {/* Personalized showcase */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-600 to-plum-900 p-8 md:grid-cols-2 md:p-12">
          <FadeIn>
            <p className="eyebrow text-gold-light">The personal touch</p>
            <h2 className="heading-lg mt-2 text-white">Gifts with their name on it — literally.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Star maps of the night you met. Mugs with their initial. Cushions embroidered in their favourite colour.
              Personalized gifts are kept at the front of the drawer forever.
            </p>
            <Link to="/category/personalized" className="btn-gold btn-lg mt-6">
              Personalize a gift <ArrowRight size={16} />
            </Link>
          </FadeIn>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {products.filter((p) => p.category === 'personalized').slice(0, 4).map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.08} className={i % 2 ? 'translate-y-6' : ''}>
                  <div className="overflow-hidden rounded-3xl shadow-lift">
                    <SmartImage src={p.images[0]} alt={p.name} className="aspect-[4/4.4] w-full" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Trending now" title="What everyone is gifting" link="/shop" />
          <ProductRow products={trending} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <SectionHeading eyebrow="Letters to us" title="Gift-givers say it best" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: 'Rhea S.', text: 'The roses arrived still cool from the farm. My wife cried — happy tears. The packaging felt like unwrapping a luxury brand.', rating: 5 },
            { name: 'Ananya P.', text: 'Best truffle cake in the city. Moist, dark, not too sweet. I have ordered it twice in one month and I regret nothing.', rating: 5 },
            { name: 'Arjun D.', text: 'She recognised the date on the star map instantly. Gallery-level quality. MemoriesCatcher is my default gift shop now.', rating: 5 },
          ].map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.07}>
              <figure className="card h-full p-6">
                <Quote size={22} className="text-rose-300" />
                <blockquote className="mt-3 text-sm leading-relaxed text-plum-600">“{t.text}”</blockquote>
                <figcaption className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-plum-900">{t.name}</span>
                  <Stars value={t.rating} />
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}

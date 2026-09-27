import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import type { Product } from '../../data/types'

export default function ProductRow({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <div className="relative">
      <div ref={ref} className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
        {products.map((p, i) => (
          <div key={p.id} className="w-[248px] flex-shrink-0 snap-start sm:w-[268px]">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute -left-3 top-[38%] z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-white shadow-lift transition hover:bg-rose-50 md:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute -right-3 top-[38%] z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-white shadow-lift transition hover:bg-rose-50 md:flex"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Save } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import SmartImage from '../../components/ui/SmartImage'
import { useCatalog } from '../../store/products'
import { CATEGORIES, CATEGORY_MAP } from '../../data/categories'
import type { Category } from '../../data/types'
import { toast } from '../../store/ui'

/** Categories are static demo data; the admin view manages display order, status and subcategories. */
export default function AdminCategories() {
  const products = useCatalog((s) => s.products)
  const [order, setOrder] = useState<Category[]>(CATEGORIES)
  const [editing, setEditing] = useState<Category | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null)

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    products.forEach((p) => {
      m[p.category] = (m[p.category] ?? 0) + 1
    })
    // virtual categories
    m['same-day'] = products.filter((p) => p.sameDay).length
    m['new-arrivals'] = products.filter((p) => p.newArrival).length
    m['best-sellers'] = products.filter((p) => p.bestSeller).length
    return m
  }, [products])

  const move = (idx: number, dir: number) => {
    const next = [...order]
    const j = idx + dir
    if (j < 0 || j >= next.length) return
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setOrder(next)
    toast.info('Display order updated (demo)')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-lg text-plum-900">Categories</h1>
          <p className="mt-1 text-sm text-plum-500">Demo catalog structure — edit names, subcategories and ordering.</p>
        </div>
        <button onClick={() => setEditing({ id: '', slug: '' as Category['slug'], name: '', tagline: '', description: '', image: '', animation: 'sparkle', subcategories: [] } as unknown as Category)} className="btn-primary btn-sm">
          <Plus size={14} /> Add category
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {order.map((c, i) => (
          <div key={c.slug} className="card overflow-hidden">
            <div className="relative h-32">
              <SmartImage src={c.image} alt={c.name} className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 to-transparent" />
              <p className="absolute bottom-3 left-4 font-display text-lg font-bold text-white">{c.name}</p>
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-plum-700">
                {counts[c.slug] ?? 0} products
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-plum-400">{c.tagline}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.subcategories.slice(0, 4).map((s) => <span key={s} className="chip text-[10px]">{s}</span>)}
                {c.subcategories.length > 4 && <span className="chip text-[10px]">+{c.subcategories.length - 4} more</span>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-plum-100 pt-3">
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg border border-plum-200 px-2 py-1 text-xs font-bold text-plum-500 disabled:opacity-30 hover:border-rose-300" aria-label="Move up">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === order.length - 1} className="rounded-lg border border-plum-200 px-2 py-1 text-xs font-bold text-plum-500 disabled:opacity-30 hover:border-rose-300" aria-label="Move down">↓</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="rounded-lg p-2 text-plum-400 hover:bg-plum-100 hover:text-plum-700" aria-label={`Edit ${c.name}`}><Pencil size={15} /></button>
                  <button onClick={() => setConfirmDelete(c)} className="rounded-lg p-2 text-plum-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${c.name}`}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.slug ? 'Edit category' : 'Add category'}>
        {editing && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              toast.success('Category saved (demo)', 'In this demo, category edits persist in local state only.')
              setEditing(null)
            }}
          >
            <div>
              <label className="label">Name</label>
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Tagline</label>
              <input className="input" value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={2} className="input resize-none" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Subcategories (comma separated)</label>
              <input className="input" value={editing.subcategories.join(', ')} onChange={(e) => setEditing({ ...editing, subcategories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input">
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <button type="submit" className="btn-primary btn-md w-full"><Save size={15} /> Save category</button>
          </form>
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete category">
        <p className="text-sm text-plum-600">
          Hide “{confirmDelete?.name}” from the storefront? Products in this category remain in the catalog.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setConfirmDelete(null)} className="btn-ghost btn-md">Cancel</button>
          <button
            onClick={() => {
              setOrder(order.filter((c) => c !== confirmDelete))
              toast.info('Category removed (demo)')
              setConfirmDelete(null)
            }}
            className="btn bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700"
          >
            Remove
          </button>
        </div>
      </Modal>
    </div>
  )
}

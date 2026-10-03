import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Pencil, Trash2, Eye, Package, ChevronLeft, Save,
} from 'lucide-react'
import { useCatalog } from '../../store/products'
import { CATEGORIES } from '../../data/categories'
import type { Product, CategorySlug } from '../../data/types'
import { money, formatDate, uid, discountPct } from '../../lib/utils'
import { toast } from '../../store/ui'
import SmartImage from '../../components/ui/SmartImage'
import Modal from '../../components/ui/Modal'
import { Stars } from '../../components/ui/Rating'

/* ————— List ————— */
export function AdminProducts() {
  const { products, deleteProduct, resetCatalog } = useCatalog()
  const [params] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [stock, setStock] = useState(params.get('stock') ?? '')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<null | { type: 'one' | 'bulk'; ids: string[] }>(null)
  const [preview, setPreview] = useState<Product | null>(null)
  const perPage = 10

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (q && !`${p.name} ${p.id} ${p.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false
        if (cat && p.category !== cat) return false
        if (stock === 'out' && p.stock !== 0) return false
        if (stock === 'low' && !(p.stock > 0 && p.stock <= 10)) return false
        if (stock === 'in' && p.stock <= 10) return false
        return true
      }),
    [products, q, cat, stock],
  )

  const paged = filtered.slice(page * perPage, page * perPage + perPage)

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set())
    else setSelected(new Set(paged.map((p) => p.id)))
  }

  const doDelete = () => {
    if (!confirmDelete) return
    confirmDelete.ids.forEach((id) => deleteProduct(id))
    toast.success(confirmDelete.type === 'bulk' ? `${confirmDelete.ids.length} products deleted` : 'Product deleted')
    setSelected(new Set())
    setConfirmDelete(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-lg text-plum-900">Products</h1>
          <p className="mt-1 text-sm text-plum-500">{products.length} in catalog · edits reflect instantly on the storefront</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { resetCatalog(); toast.info('Catalog restored', 'Demo products restored from the built-in data file.') }} className="btn-outline btn-sm">
            Reset demo catalog
          </button>
          <Link to="/admin/products/new" className="btn-primary btn-sm"><Plus size={14} /> Add product</Link>
        </div>
      </div>

      {/* filters */}
      <div className="card mt-5 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search name, ID or tag…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} />
        </div>
        <select className="input w-44" value={cat} onChange={(e) => { setCat(e.target.value); setPage(0) }} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select className="input w-40" value={stock} onChange={(e) => { setStock(e.target.value); setPage(0) }} aria-label="Filter by stock">
          <option value="">All stock</option>
          <option value="in">In stock</option>
          <option value="low">Low (&le;10)</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {/* bulk bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-plum-800 px-5 py-3 text-cream">
          <p className="text-sm font-semibold">{selected.size} selected</p>
          <button
            onClick={() => setConfirmDelete({ type: 'bulk', ids: [...selected] })}
            className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
          >
            Delete selected
          </button>
        </div>
      )}

      {/* table */}
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-plum-100 text-left text-xs uppercase tracking-wider text-plum-400">
              <th className="p-4"><input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} className="h-4 w-4 rounded accent-rose-600" aria-label="Select all" /></th>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p.id} className="border-b border-plum-50 last:border-0 hover:bg-plum-50/50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => {
                      const next = new Set(selected)
                      if (next.has(p.id)) next.delete(p.id)
                      else next.add(p.id)
                      setSelected(next)
                    }}
                    className="h-4 w-4 rounded accent-rose-600"
                    aria-label={`Select ${p.name}`}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl">
                      <SmartImage src={p.images[0]} alt="" className="h-full w-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-[220px] truncate font-semibold text-plum-900">{p.name}</p>
                      <p className="text-xs text-plum-300">{p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 capitalize text-plum-600">{p.category}</td>
                <td className="p-4">
                  <p className="font-bold text-plum-900">{money(p.price)}</p>
                  {p.originalPrice && <p className="text-xs text-plum-300 line-through">{money(p.originalPrice)}</p>}
                </td>
                <td className="p-4">
                  <span className={`font-bold ${p.stock === 0 ? 'text-rose-600' : p.stock <= 10 ? 'text-amber-600' : 'text-mint-deep'}`}>{p.stock}</span>
                </td>
                <td className="p-4">
                  <span className={`badge ${p.stock === 0 ? 'bg-plum-100 text-plum-500' : 'bg-emerald-100 text-emerald-700'}`}>{p.stock === 0 ? 'Out of stock' : 'Active'}</span>
                </td>
                <td className="p-4"><Stars value={p.rating} /></td>
                <td className="p-4 text-plum-500">{formatDate(p.createdAt)}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setPreview(p)} aria-label={`Preview ${p.name}`} className="rounded-lg p-2 text-plum-400 hover:bg-plum-100 hover:text-plum-700"><Eye size={15} /></button>
                    <Link to={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`} className="rounded-lg p-2 text-plum-400 hover:bg-plum-100 hover:text-plum-700"><Pencil size={15} /></Link>
                    <button onClick={() => setConfirmDelete({ type: 'one', ids: [p.id] })} aria-label={`Delete ${p.name}`} className="rounded-lg p-2 text-plum-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={9} className="p-10 text-center text-plum-400">No products match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {filtered.length > perPage && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-plum-400">Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-outline btn-sm">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * perPage >= filtered.length} className="btn-outline btn-sm">Next</button>
          </div>
        </div>
      )}

      {/* preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Product preview" wide>
        {preview && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-2">
              {preview.images.map((img, i) => (
                <SmartImage key={i} src={img} alt="" className={`rounded-2xl ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`} />
              ))}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-plum-900">{preview.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-plum-400">{preview.category} · {preview.subcategory}</p>
              <p className="mt-3 text-sm text-plum-600">{preview.description}</p>
              <p className="mt-3 text-lg font-bold text-plum-900">{money(preview.price)}{preview.originalPrice ? ` (was ${money(preview.originalPrice)})` : ''}</p>
              <p className="mt-1 text-xs text-plum-400">Stock: {preview.stock} · SKU: {preview.id.toUpperCase()}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {preview.tags.map((t) => <span key={t} className="chip text-[11px]">{t}</span>)}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* delete confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirm delete">
        <p className="text-sm text-plum-600">
          Delete {confirmDelete?.ids.length === 1 ? 'this product' : `${confirmDelete?.ids.length} products`} from the demo catalog?
          The storefront will stop showing them immediately.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setConfirmDelete(null)} className="btn-ghost btn-md">Cancel</button>
          <button onClick={doDelete} className="btn bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700">Delete</button>
        </div>
      </Modal>
    </div>
  )
}

/* ————— Add / Edit form ————— */
const EMPTY_FORM = {
  name: '', description: '', category: 'flowers' as CategorySlug, subcategory: '',
  price: '', originalPrice: '', stock: '', sku: '', tags: '', occasion: 'birthday',
  delivery: true, featured: false, bestSeller: false, newArrival: false, status: 'Active',
  images: '',
}

export function AdminProductForm() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { products, addProduct, updateProduct } = useCatalog()
  const existing = products.find((p) => p.id === productId)

  const [form, setForm] = useState(() =>
    existing
      ? {
          name: existing.name, description: existing.description, category: existing.category,
          subcategory: existing.subcategory, price: String(existing.price),
          originalPrice: existing.originalPrice?.toString() ?? '', stock: String(existing.stock),
          sku: existing.id.toUpperCase(), tags: existing.tags.join(', '),
          occasion: existing.occasions[0] ?? 'birthday', delivery: existing.sameDay ?? false,
          featured: !!existing.featured, bestSeller: !!existing.bestSeller, newArrival: !!existing.newArrival,
          status: existing.stock === 0 ? 'Out of stock' : 'Active',
          images: existing.images.join('\n'),
        }
      : { ...EMPTY_FORM },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const previewImages = form.images.split('\n').map((s) => s.trim()).filter(Boolean)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 3) errs.name = 'Name must be at least 3 characters'
    if (form.description.trim().length < 20) errs.description = 'Description should be at least 20 characters'
    if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price'
    if (form.originalPrice && Number(form.originalPrice) <= Number(form.price)) errs.originalPrice = 'Original price must be higher than selling price'
    if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Enter stock quantity (0 for out of stock)'
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Check the form', 'Some fields need attention.')
      return
    }

    const catDefaults: Record<string, string[]> = {
      flowers: ['photo-1490750967868-88aa4486c946', 'photo-1508610048659-a06b669e3321', 'photo-1457089328109-e5d9bd499191', 'photo-1487070183336-b863922373d4'],
      cakes: ['photo-1578985545062-69928b1d9587', 'photo-1535141192574-5d4897c12636', 'photo-1587668178277-295251f900ce', 'photo-1464349095431-e9a21285b5f3'],
      plants: ['photo-1416879595882-3373a0480b5b', 'photo-1466692476868-aef1dfb1e735', 'photo-1485955900006-10f4d324d411', 'photo-1463320726281-696a485928c7'],
      chocolates: ['photo-1481391319762-47dff72954d9', 'photo-1511381939415-e44015466834', 'photo-1606312619070-d48b4c652a52', 'photo-1549007994-cb92caebd54b'],
      hampers: ['photo-1513885535751-8b9238bd345a', 'photo-1549465220-1a8b9238cd48', 'photo-1513201099705-a9746e1e201f'],
      gifts: ['photo-1549465220-1a8b9238cd48', 'photo-1512909006721-3d6018887383'],
    }

    const images = previewImages.length
      ? previewImages.map((s) => (s.startsWith('http') ? s : `https://images.unsplash.com/${s}?auto=format&fit=crop&w=900&q=80`))
      : (catDefaults[form.category] ?? catDefaults.gifts).map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`)

    const base: Product = existing ?? {
      id: uid('vel').toUpperCase(),
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || uid('gift'),
      rating: 4.5,
      reviewCount: 0,
      variants: [],
      color: undefined,
      name: '',
      description: '',
      category: 'flowers',
      subcategory: 'General',
      price: 0,
      stock: 0,
      tags: [],
      occasions: [],
      highlights: ['Handpicked by the MemoriesCatcher atelier', 'Demo product created via admin console'],
      images: [],
      createdAt: new Date().toISOString().slice(0, 10),
    }

    const next: Product = {
      ...base,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory || CATEGORIES.find((c) => c.slug === form.category)?.subcategories[0] || 'General',
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      occasions: [form.occasion],
      sameDay: form.delivery,
      featured: form.featured || undefined,
      bestSeller: form.bestSeller || undefined,
      newArrival: form.newArrival || undefined,
      images,
    }

    if (existing) {
      updateProduct(next)
      toast.success('Product updated', 'Changes are live on the storefront (demo).')
    } else {
      addProduct(next)
      toast.success('Product added', 'It is now live on the storefront (demo).')
    }
    navigate('/admin/products')
  }

  const field = (label: string, node: React.ReactNode, err?: string) => (
    <div>
      <label className="label">{label}</label>
      {node}
      {err && <p className="field-error">{err}</p>}
    </div>
  )

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-plum-500 hover:text-rose-600">
        <ChevronLeft size={15} /> Back to products
      </Link>
      <h1 className="heading-lg text-plum-900">{existing ? 'Edit product' : 'Add product'}</h1>
      {existing && <p className="mt-1 text-xs text-plum-400">{existing.id} · {existing.slug}</p>}

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]" noValidate>
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-plum-900">Basic information</h2>
            {field('Product name', <input className={`input ${errors.name ? 'border-rose-400' : ''}`} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Blush Romance Rose Bouquet" />, errors.name)}
            {field('Description', <textarea rows={4} className={`input resize-none ${errors.description ? 'border-rose-400' : ''}`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What makes this gift special?" />, errors.description)}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('Category', (
                <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.filter((c) => !['same-day', 'new-arrivals', 'best-sellers'].includes(c.slug)).map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              ))}
              {field('Subcategory', (
                <select className="input" value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
                  <option value="">Auto (first of category)</option>
                  {(CATEGORIES.find((c) => c.slug === form.category)?.subcategories ?? []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-plum-900">Pricing & inventory</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('Price (₹)', <input type="number" min="1" className={`input ${errors.price ? 'border-rose-400' : ''}`} value={form.price} onChange={(e) => set('price', e.target.value)} />, errors.price)}
              {field('Original price (₹, optional)', <input type="number" min="1" className={`input ${errors.originalPrice ? 'border-rose-400' : ''}`} value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} />, errors.originalPrice)}
              {field('Stock quantity', <input type="number" min="0" className={`input ${errors.stock ? 'border-rose-400' : ''}`} value={form.stock} onChange={(e) => set('stock', e.target.value)} />, errors.stock)}
              {field('SKU (auto for new)', <input className="input" value={form.sku} onChange={(e) => set('sku', e.target.value)} disabled={!!existing} />)}
            </div>
            {form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
              <p className="rounded-xl bg-mint/10 px-3 py-2 text-xs font-bold text-mint-deep">
                {discountPct(Number(form.price), Number(form.originalPrice))}% discount badge will show on the storefront
              </p>
            )}
          </div>

          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-plum-900">Images</h2>
            {field('Image URLs or Unsplash photo IDs (one per line)', (
              <textarea
                rows={4}
                className="input resize-none font-mono text-xs"
                value={form.images}
                onChange={(e) => set('images', e.target.value)}
                placeholder={'photo-1490750967868-88aa4486c946\nhttps://images.unsplash.com/...'}
              />
            ))}
            {previewImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previewImages.slice(0, 6).map((src, i) => (
                  <SmartImage key={i} src={src.startsWith('http') ? src : `https://images.unsplash.com/${src}?auto=format&fit=crop&w=200&q=70`} alt="" className="h-16 w-16 rounded-xl" />
                ))}
              </div>
            )}
            <p className="text-xs text-plum-400">Leave empty to use category defaults. Full URLs or Unsplash photo ids both work.</p>
          </div>
        </div>

        {/* side */}
        <div className="space-y-6">
          <div className="card space-y-3.5 p-6">
            <h2 className="font-display text-lg font-bold text-plum-900">Organization</h2>
            {field('Tags (comma separated)', <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="roses, pink, premium" />)}
            {field('Primary occasion', (
              <select className="input" value={form.occasion} onChange={(e) => set('occasion', e.target.value)}>
                {['birthday', 'anniversary', 'wedding', 'congratulations', 'thank-you', 'corporate', 'love-romance', 'get-well', 'housewarming', 'just-because'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ))}
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-plum-700">
              <input type="checkbox" checked={form.delivery} onChange={(e) => set('delivery', e.target.checked)} className="h-4 w-4 rounded accent-rose-600" /> Same-day delivery available
            </label>
          </div>

          <div className="card space-y-3.5 p-6">
            <h2 className="font-display text-lg font-bold text-plum-900">Merchandising</h2>
            {[
              { k: 'featured' as const, label: 'Featured product' },
              { k: 'bestSeller' as const, label: 'Best seller' },
              { k: 'newArrival' as const, label: 'New arrival' },
            ].map((t) => (
              <label key={t.k} className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-plum-700">
                <input type="checkbox" checked={form[t.k]} onChange={(e) => set(t.k, e.target.checked)} className="h-4 w-4 rounded accent-rose-600" /> {t.label}
              </label>
            ))}
            {field('Status', (
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option>Active</option><option>Out of stock</option>
              </select>
            ))}
          </div>

          <div className="card p-6">
            <button type="submit" className="btn-primary btn-lg w-full"><Save size={16} /> {existing ? 'Save changes' : 'Publish product'}</button>
            <p className="mt-3 text-center text-[11px] text-plum-300">Changes appear on the storefront instantly (demo, session persistence).</p>
          </div>
        </div>
      </form>
    </div>
  )
}

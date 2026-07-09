import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiGrid, FiList } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/product/ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Grey', 'Navy', 'Maroon'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Most Discounted' },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, pagination, loading } = useSelector(s => s.products);

  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState({ price: true, size: true, color: true, rating: true });
  const [localFilters, setLocalFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
    rating: searchParams.get('rating') || '',
    discount: searchParams.get('discount') || '',
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const buildParams = useCallback(() => {
    const p = { page, sort };
    if (searchParams.get('search')) p.search = searchParams.get('search');
    if (searchParams.get('gender')) p.gender = searchParams.get('gender');
    if (searchParams.get('category')) p.category = searchParams.get('category');
    if (searchParams.get('isNewArrival')) p.isNewArrival = true;
    if (searchParams.get('isBestSeller')) p.isBestSeller = true;
    if (searchParams.get('isFlashSale')) p.isFlashSale = true;
    if (localFilters.minPrice) p.minPrice = localFilters.minPrice;
    if (localFilters.maxPrice) p.maxPrice = localFilters.maxPrice;
    if (localFilters.sizes.length) p.sizes = localFilters.sizes.join(',');
    if (localFilters.colors.length) p.colors = localFilters.colors.join(',');
    if (localFilters.rating) p.rating = localFilters.rating;
    if (localFilters.discount) p.discount = localFilters.discount;
    return p;
  }, [page, sort, localFilters, searchParams]);

  useEffect(() => {
    dispatch(fetchProducts(buildParams()));
  }, [dispatch, buildParams]);

  const toggleArrayFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setLocalFilters({ minPrice: '', maxPrice: '', sizes: [], colors: [], rating: '', discount: '' });
    setPage(1);
  };

  const activeFilterCount = [
    localFilters.minPrice || localFilters.maxPrice ? 1 : 0,
    localFilters.sizes.length,
    localFilters.colors.length,
    localFilters.rating ? 1 : 0,
    localFilters.discount ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const title = searchParams.get('search') ? `Search: "${searchParams.get('search')}"` :
    searchParams.get('gender') ? `${searchParams.get('gender').charAt(0).toUpperCase() + searchParams.get('gender').slice(1)}'s Fashion` :
    searchParams.get('isNewArrival') ? 'New Arrivals' :
    searchParams.get('isBestSeller') ? 'Best Sellers' :
    searchParams.get('isFlashSale') ? '⚡ Flash Sale' : 'All Products';

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-dark-950 dark:text-white">{title}</h1>
            {pagination && <p className="font-body text-sm text-stone-400 mt-1">{pagination.total} products found</p>}
          </div>
          <div className="flex items-center space-x-3">
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              className="font-body text-sm bg-white dark:bg-dark-900 border border-stone-200 dark:border-dark-700 text-dark-700 dark:text-stone-300 px-4 py-2 rounded focus:outline-none focus:border-gold-400 cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFilterOpen(true)}
              className="flex items-center space-x-2 bg-white dark:bg-dark-900 border border-stone-200 dark:border-dark-700 px-4 py-2 rounded text-sm font-body text-dark-700 dark:text-stone-300 hover:border-gold-400 transition-colors lg:hidden">
              <FiFilter size={16} />
              <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filter — Desktop */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <FilterPanel localFilters={localFilters} setLocalFilters={setLocalFilters}
              toggleArrayFilter={toggleArrayFilter} clearFilters={clearFilters}
              expandedFilter={expandedFilter} setExpandedFilter={setExpandedFilter}
              activeFilterCount={activeFilterCount} setPage={setPage} />
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {filterOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-dark-950/60 z-40 lg:hidden" onClick={() => setFilterOpen(false)} />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween' }}
                  className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-dark-950 z-50 overflow-y-auto p-6 lg:hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading text-xl text-dark-950 dark:text-white">Filters</h2>
                    <button onClick={() => setFilterOpen(false)}><FiX size={22} className="text-dark-500" /></button>
                  </div>
                  <FilterPanel localFilters={localFilters} setLocalFilters={setLocalFilters}
                    toggleArrayFilter={toggleArrayFilter} clearFilters={clearFilters}
                    expandedFilter={expandedFilter} setExpandedFilter={setExpandedFilter}
                    activeFilterCount={activeFilterCount} setPage={setPage} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="skeleton aspect-[3/4] rounded-xl" />
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (products?.length || 0) === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-3xl text-dark-300 dark:text-dark-600 mb-4">No products found</p>
                <p className="font-body text-stone-400">Try adjusting your filters</p>
                <button onClick={clearFilters} className="mt-4 btn-gold rounded-sm text-sm">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products?.map(product => (
                    <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center space-x-2 mt-12">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button key={i} onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded font-body text-sm transition-all ${page === i + 1 ? 'bg-gold-400 text-dark-950 font-bold' : 'bg-white dark:bg-dark-900 text-dark-600 dark:text-stone-400 border border-stone-200 dark:border-dark-700 hover:border-gold-400'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, expanded, toggle, children }) {
  return (
    <div className="border-b border-stone-100 dark:border-dark-800 pb-4 mb-4">
      <button onClick={toggle} className="flex items-center justify-between w-full py-2">
        <span className="font-body font-semibold text-sm tracking-widest uppercase text-dark-800 dark:text-stone-200">{title}</span>
        {expanded ? <FiChevronUp size={16} className="text-dark-400" /> : <FiChevronDown size={16} className="text-dark-400" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({ localFilters, setLocalFilters, toggleArrayFilter, clearFilters, expandedFilter, setExpandedFilter, activeFilterCount, setPage }) {
  const toggle = (key) => setExpandedFilter(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-white dark:bg-dark-900 rounded-xl p-5 border border-stone-100 dark:border-dark-800">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-base text-dark-950 dark:text-white">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-body text-gold-400 hover:underline">Clear All ({activeFilterCount})</button>
        )}
      </div>

      <FilterSection title="Price Range" expanded={expandedFilter.price} toggle={() => toggle('price')}>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={localFilters.minPrice}
            onChange={e => { setLocalFilters(p => ({ ...p, minPrice: e.target.value })); setPage(1); }}
            className="w-full border border-stone-200 dark:border-dark-700 rounded px-3 py-2 text-sm font-body bg-transparent dark:text-white focus:outline-none focus:border-gold-400" />
          <input type="number" placeholder="Max" value={localFilters.maxPrice}
            onChange={e => { setLocalFilters(p => ({ ...p, maxPrice: e.target.value })); setPage(1); }}
            className="w-full border border-stone-200 dark:border-dark-700 rounded px-3 py-2 text-sm font-body bg-transparent dark:text-white focus:outline-none focus:border-gold-400" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[['Under ₹500', '0', '500'], ['₹500-₹1000', '500', '1000'], ['₹1000-₹2000', '1000', '2000'], ['Above ₹2000', '2000', '']].map(([label, min, max]) => (
            <button key={label} onClick={() => { setLocalFilters(p => ({ ...p, minPrice: min, maxPrice: max })); setPage(1); }}
              className={`text-xs font-body px-3 py-1.5 rounded border transition-colors ${localFilters.minPrice === min && localFilters.maxPrice === max ? 'border-gold-400 text-gold-400 bg-gold-400/5' : 'border-stone-200 dark:border-dark-700 text-stone-500 hover:border-gold-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size" expanded={expandedFilter.size} toggle={() => toggle('size')}>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button key={size} onClick={() => toggleArrayFilter('sizes', size)}
              className={`w-10 h-10 text-xs font-body rounded border transition-all ${localFilters.sizes.includes(size) ? 'border-gold-400 bg-gold-400 text-dark-950 font-bold' : 'border-stone-200 dark:border-dark-700 text-dark-600 dark:text-stone-400 hover:border-gold-400'}`}>
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color" expanded={expandedFilter.color} toggle={() => toggle('color')}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button key={color} onClick={() => toggleArrayFilter('colors', color)}
              className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${localFilters.colors.includes(color) ? 'border-gold-400 text-gold-400 bg-gold-400/10' : 'border-stone-200 dark:border-dark-700 text-stone-500 hover:border-gold-400'}`}>
              {color}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rating" expanded={expandedFilter.rating} toggle={() => toggle('rating')}>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => { setLocalFilters(p => ({ ...p, rating: p.rating === String(r) ? '' : String(r) })); setPage(1); }}
              className={`flex items-center space-x-2 w-full py-1 text-sm font-body transition-colors ${localFilters.rating === String(r) ? 'text-gold-400' : 'text-stone-500 hover:text-gold-400'}`}>
              <span>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
              <span>& above</span>
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Discount" expanded={expandedFilter.discount || false} toggle={() => toggle('discount')}>
        <div className="space-y-2">
          {[10, 20, 30, 50].map(d => (
            <button key={d} onClick={() => { setLocalFilters(p => ({ ...p, discount: p.discount === String(d) ? '' : String(d) })); setPage(1); }}
              className={`w-full text-left text-sm font-body py-1 transition-colors ${localFilters.discount === String(d) ? 'text-gold-400' : 'text-stone-500 hover:text-gold-400'}`}>
              {d}% or more
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

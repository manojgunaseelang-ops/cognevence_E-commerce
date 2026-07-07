import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

const categories = [
  {
    id: 'sport-shoes',
    title: 'Sport Running Shoes',
    description: 'Explore high-performance running and training shoes.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop',
    route: '/categories/sport-shoes',
    icon: '👟',
  },
  {
    id: 'mobile',
    title: 'Mobile Phones',
    description: 'Latest smartphones, top brands, and flagship hardware.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop',
    route: '/categories/mobile',
    icon: '📱',
  },
  {
    id: 'faction',
    title: 'Clothings & Fashion',
    description: 'Discover trendy everyday styles and quality brand apparel.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop',
    route: '/categories/faction',
    icon: '👗',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    description: 'Complete your daily setup with backpacks, watches, and smart gear.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop',
    route: '/categories/accessories',
    icon: '🎒',
  },
  {
    id: 'electronic',
    title: 'Electronics',
    description: 'Immersive sound systems, high-definition displays, and smart utilities.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop',
    route: '/categories/electronic',
    icon: '💻',
  },
  {
    id: 'kitchen',
    title: 'Home & Kitchen Essentials',
    description: 'Upgrade your living space with advanced cookers and smart purifiers.',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop',
    route: '/categories/kitchen',
    icon: '🍳',
  },
];

export default function Categries() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 page-with-navbar">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Shop by category</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Find what you need
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Browse top categories and quickly jump to the products you love.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              onClick={() => navigate(category.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  navigate(category.route);
                }
              }}
            >
              <div className="h-56 overflow-hidden bg-slate-100">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-4 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                    {category.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                      Category
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                      {category.title}
                    </h2>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600">{category.description}</p>
                <button
                  type="button"
                  className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(category.route);
                  }}
                >
                  Explore
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

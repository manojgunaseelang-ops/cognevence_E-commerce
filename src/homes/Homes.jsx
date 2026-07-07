import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Loader from "../components/Loader";
import { getProductImage, handleImageError } from '../utils/images';


export default function Homes() {
  const navigate = useNavigate();
  const [frequentlySearched, setFrequentlySearched] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Fetch some mobile products as frequently searched
        const response = await fetch('http://localhost:4000/mobileproduct');
        const data = await response.json();
        setFrequentlySearched(data.data?.slice(0, 6) || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-50 page-with-navbar">
        <Navbar />
        <Loader text="" variant="overlay" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 page-with-navbar">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-14 text-white shadow-xl sm:px-10 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-100">Welcome to Well Store</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Discover more of products at great prices
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100/90">
              Shop top categories, compare the best deals, and find everything for your home, tech, fashion, and more.
            </p>
            <button
              type="button"
              className="mt-10 inline-flex rounded-full bg-white px-8 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
              onClick={() => navigate('/categories')}
            >
              Start Shopping
            </button>
          </div>
        </section>

        {!loading && frequentlySearched.length > 0 && (
          <section className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Frequently searched</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">Popular picks</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {frequentlySearched.map((product) => (
                <div key={product._id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="h-56 bg-slate-100">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="space-y-3 p-5 sm:p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{product.brand}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-lg font-semibold text-blue-600">₹{product.price?.toLocaleString() || 'N/A'}</p>
                      <button
                        type="button"
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        onClick={() => navigate(`/categories/mobile?productId=${product._id}`)}
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🚚', title: 'Free Delivery', description: 'On orders over ₹500' },
              { icon: '🔄', title: 'Easy Returns', description: '30-day return policy' },
              { icon: '💳', title: 'Secure Payment', description: '100% secure transactions' },
              { icon: '🎯', title: 'Best Prices', description: 'Price match guarantee' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center transition hover:border-blue-200 hover:shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] bg-slate-900 px-6 py-8 text-center text-white sm:px-10 sm:py-10">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Well Store</p>
          <p className="mt-3 text-base leading-7 text-slate-300">Trusted shopping for home essentials, gadgets, fashion, and more.</p>
          <p className="mt-4 text-sm text-slate-400">© 2024 Well Store. All rights reserved.</p>
        </section>
      </main>
    </div>
  )
}
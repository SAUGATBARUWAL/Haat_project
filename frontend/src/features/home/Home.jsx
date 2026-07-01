import Navbar from "../../components/navbar/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold">
            Welcome to HAAT
          </h1>

          <p className="mt-4 text-gray-600 text-lg">
            Buy from local businesses near you.
          </p>

          <button className="mt-8 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700">
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories */}

      {/* Featured Products */}

      {/* Footer */}
    </>
  );
}
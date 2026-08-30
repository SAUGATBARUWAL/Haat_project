import Navbar from "../../components/navbar/Navbar";
import Hero from "../../components/hero/Hero";
import Categories from "../../components/categories/Categories";
import FeaturedProducts from "../../components/hero/FeaturedProducts";
import Footer from "../../components/footer/Footer";

export default function Home() {
    return (
        <>
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 mt-7">
                <Hero />
            </div>

            {/* Categories */}
            <Categories />

            {/* Featured Products */}
            <FeaturedProducts />

            {/* Footer */}
            <Footer />
        </>
    );
}
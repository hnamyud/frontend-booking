<script>
    import { fade, slide } from "svelte/transition";
    import { Menu, X, Globe, User, MapPin } from "lucide-svelte";
    import HeroSection from "./lib/components/HeroSection.svelte";
    import FeaturesGrid from "./lib/components/FeaturesGrid.svelte";
    import DestinationCard from "./lib/components/DestinationCard.svelte";

    let isMobileMenuOpen = false;

    const destinations = [
        {
            image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop",
            title: "Swiss Alps",
            price: "1,299",
            rating: "4.9",
        },
        {
            image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
            title: "Kyoto, Japan",
            price: "1,599",
            rating: "4.8",
        },
        {
            image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070&auto=format&fit=crop",
            title: "Bali, Indonesia",
            price: "899",
            rating: "4.7",
        },
        {
            image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop",
            title: "Santorini, Greece",
            price: "1,499",
            rating: "4.9",
        },
    ];
</script>

<div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <!-- Navigation -->
    <nav
        class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300"
    >
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-20">
                <!-- Logo -->
                <a href="/" class="flex items-center gap-2 group">
                    <div
                        class="bg-emerald-600 text-white p-2 rounded-lg group-hover:bg-emerald-700 transition-colors"
                    >
                        <Globe size={24} />
                    </div>
                    <span
                        class="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent"
                    >
                        TravelVibe
                    </span>
                </a>

                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center gap-8">
                    <a
                        href="#destinations"
                        class="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                        >Destinations</a
                    >
                    <a
                        href="#features"
                        class="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                        >Why Us</a
                    >
                    <a
                        href="#about"
                        class="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                        >About</a
                    >
                    <a
                        href="#contact"
                        class="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                        >Contact</a
                    >
                </div>

                <!-- Actions -->
                <div class="hidden md:flex items-center gap-4">
                    <button
                        class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/30"
                    >
                        Sign In
                    </button>
                </div>

                <!-- Mobile Menu Button -->
                <button
                    class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    on:click={() => (isMobileMenuOpen = !isMobileMenuOpen)}
                >
                    {#if isMobileMenuOpen}
                        <X size={24} />
                    {:else}
                        <Menu size={24} />
                    {/if}
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        {#if isMobileMenuOpen}
            <div
                transition:slide={{ duration: 300 }}
                class="md:hidden bg-white border-t border-slate-100 absolute w-full"
            >
                <div class="container mx-auto px-4 py-4 flex flex-col gap-4">
                    <a
                        href="#destinations"
                        class="text-slate-600 hover:text-emerald-600 font-medium py-2"
                        >Destinations</a
                    >
                    <a
                        href="#features"
                        class="text-slate-600 hover:text-emerald-600 font-medium py-2"
                        >Why Us</a
                    >
                    <a
                        href="#about"
                        class="text-slate-600 hover:text-emerald-600 font-medium py-2"
                        >About</a
                    >
                    <a
                        href="#contact"
                        class="text-slate-600 hover:text-emerald-600 font-medium py-2"
                        >Contact</a
                    >
                    <hr class="border-slate-100" />
                    <div class="flex flex-col gap-3">
                        <button
                            class="w-full text-slate-600 hover:text-emerald-600 font-medium py-2 border border-slate-200 rounded-xl"
                            >Log In</button
                        >
                        <button
                            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium shadow-lg shadow-emerald-500/20"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    </nav>

    <!-- Hero Section -->
    <HeroSection />

    <!-- Destinations Section -->
    <section id="destinations" class="py-20 container mx-auto px-4">
        <div class="flex items-end justify-between mb-12">
            <div>
                <h2 class="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
                    Popular Destinations
                </h2>
                <p class="text-gray-600 max-w-xl">
                    Discover the most visited places this season. Book your
                    dream vacation today.
                </p>
            </div>
            <a
                href="#"
                class="hidden md:flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
            >
                View All <span class="text-xl">→</span>
            </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {#each destinations as dest}
                <DestinationCard {...dest} />
            {/each}
        </div>

        <div class="mt-8 text-center md:hidden">
            <button class="text-emerald-600 font-bold hover:underline"
                >View All Destinations</button
            >
        </div>
    </section>

    <!-- Features Section -->
    <div id="features" class="bg-slate-50">
        <FeaturesGrid />
    </div>

    <!-- Newsletter Section -->
    <section class="py-20 container mx-auto px-4">
        <div
            class="bg-sky-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
        >
            <!-- Decorative circles -->
            <div
                class="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"
            ></div>
            <div
                class="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"
            ></div>

            <div class="relative z-10 max-w-2xl mx-auto">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
                    Subscribe to our Newsletter
                </h2>
                <p class="text-sky-100 mb-10 text-lg">
                    Get the latest travel updates, exclusive deals, and
                    inspiring stories delivered to your inbox.
                </p>

                <div class="flex flex-col sm:flex-row gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        class="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200 focus:outline-none focus:bg-white/20 transition-all"
                    />
                    <button
                        class="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                    >
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 pt-16 pb-8">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                    <a href="/" class="flex items-center gap-2 mb-6">
                        <div class="bg-emerald-600 text-white p-1.5 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <span class="text-xl font-bold text-sky-900"
                            >TravelVibe</span
                        >
                    </a>
                    <p class="text-gray-500 leading-relaxed">
                        Making your travel dreams come true with unforgettable
                        experiences and premium service.
                    </p>
                </div>

                <div>
                    <h4 class="font-bold text-sky-900 mb-6">Company</h4>
                    <ul class="space-y-4 text-gray-500">
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >About Us</a
                            >
                        </li>
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >Careers</a
                            >
                        </li>
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >Blog</a
                            >
                        </li>
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >Press</a
                            >
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-sky-900 mb-6">Support</h4>
                    <ul class="space-y-4 text-gray-500">
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >Contact Us</a
                            >
                        </li>
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >Terms of Service</a
                            >
                        </li>
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >Privacy Policy</a
                            >
                        </li>
                        <li>
                            <a
                                href="#"
                                class="hover:text-emerald-600 transition-colors"
                                >FAQ</a
                            >
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-sky-900 mb-6">Get in Touch</h4>
                    <ul class="space-y-4 text-gray-500">
                        <li class="flex items-center gap-3">
                            <span
                                class="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"
                            >
                                <MapPin size={16} />
                            </span>
                            123 Adventure Lane, NY
                        </li>
                        <li class="flex items-center gap-3">
                            <span
                                class="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"
                            >
                                <User size={16} />
                            </span>
                            support@travelvibe.com
                        </li>
                    </ul>
                </div>
            </div>

            <div
                class="border-t border-slate-100 pt-8 text-center text-gray-400 text-sm"
            >
                © 2024 TravelVibe. All rights reserved.
            </div>
        </div>
    </footer>
</div>

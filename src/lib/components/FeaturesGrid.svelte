<script>
    import { Shield, Map, Clock, Heart } from "lucide-svelte";

    const features = [
        {
            icon: Map,
            title: "Expert Guides",
            description:
                "Our local guides know every hidden gem and secret spot.",
        },
        {
            icon: Shield,
            title: "Safe Travel",
            description:
                "Your safety is our priority with 24/7 support and insurance.",
        },
        {
            icon: Clock,
            title: "Flexible Booking",
            description:
                "Change your plans up to 24h before departure for free.",
        },
        {
            icon: Heart,
            title: "Curated Trips",
            description: "Hand-picked experiences for unforgettable memories.",
        },
    ];
</script>

<section class="py-20 bg-white">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
                Why Choose Us
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
                We provide the best travel experience with safety, comfort, and
                unforgettable adventures.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {#each features as feature}
                <div
                    class="p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 group"
                >
                    <div
                        class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                        <svelte:component
                            this={feature.icon}
                            class="w-6 h-6 text-emerald-600"
                        />
                    </div>
                    <h3 class="text-xl font-bold text-sky-900 mb-3">
                        {feature.title}
                    </h3>
                    <p class="text-gray-600 leading-relaxed">
                        {feature.description}
                    </p>
                </div>
            {/each}
        </div>
    </div>
</section>

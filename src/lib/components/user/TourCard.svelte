<script>
    import { MapPin, Clock, Star } from "lucide-svelte";

    export let tour;

    function formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    }

    // Use the first destination's first image as the cover, fallback to tour images if any
    $: coverImage =
        tour.destinations?.[0]?.images?.[0]?.url ||
        tour.images?.[0]?.url ||
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";
    $: destinationName = tour.destinations?.[0]?.name || "Unknown Destination";
</script>

<div
    class="group cursor-pointer"
    on:click={() =>
        window.dispatchEvent(
            new CustomEvent("app:navigate", {
                detail: `/tours/${tour.slug || tour._id}`,
            }),
        )}
>
    <div class="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
        <img
            src={coverImage}
            alt={tour.name}
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute top-3 right-3">
            <button
                class="bg-white/90 hover:bg-white p-2 rounded-full transition-colors shadow-sm"
                on:click|stopPropagation
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5 text-slate-600"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                </svg>
            </button>
        </div>
    </div>

    <div>
        <div class="flex justify-between items-start mb-1">
            <h3
                class="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1"
            >
                {destinationName}
            </h3>
            <div class="flex items-center gap-1">
                <span class="text-sm font-bold text-slate-900"
                    >{formatPrice(tour.price)}</span
                >
            </div>
        </div>
        <div class="text-slate-500 text-sm mb-1 line-clamp-1">{tour.name}</div>
        <div class="text-slate-500 text-sm flex items-center gap-2">
            <span>{tour.duration}</span>
            {#if tour.ratingAverage}
                <div class="flex items-center gap-1 ml-2">
                    <Star size={14} class="fill-yellow-400 text-yellow-400" />
                    <span class="font-bold text-xs text-slate-700"
                        >{tour.ratingAverage}</span
                    >
                    <span class="text-xs text-slate-400"
                        >({tour.ratingQuantity})</span
                    >
                </div>
            {/if}
        </div>
    </div>
</div>

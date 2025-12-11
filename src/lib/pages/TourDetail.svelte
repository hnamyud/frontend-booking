<script>
    import { onMount } from "svelte";
    import { api } from "../api.svelte";
    import {
        MapPin,
        Clock,
        Calendar,
        Users,
        CheckCircle2,
        Info,
        CreditCard,
        Plane,
        Shield,
        Star,
        ChevronRight,
        ArrowLeft,
        X,
        ChevronLeft,
    } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";

    export let params = {}; // Will receive id from manual router logic
    let tourId = "";
    let tour = null;
    let isLoading = true;
    let error = "";
    let activeTab = "itinerary";

    // Lightbox State
    let isGalleryOpen = false;
    let currentImageIndex = 0;

    // Booking State
    let guests = 1;
    let selectedDate = "";

    // Derived
    $: if (params && params.id) tourId = params.id;
    $: totalPrice = tour ? tour.price * guests : 0;
    $: allImages = tour
        ? [
              ...(tour.images || []),
              ...(tour.destinations
                  ? tour.destinations.flatMap((d) => d.images || [])
                  : []),
          ].filter((img) => img && img.url)
        : [];
    $: displayImages = allImages.slice(0, 5); // Limit to 5 for gallery

    async function fetchTour() {
        if (!tourId) return;
        isLoading = true;
        try {
            const res = await api.getTour(tourId);
            tour = res.data;
            if (tour.timeStart) {
                selectedDate = tour.timeStart;
            }
        } catch (err) {
            console.error(err);
            error = "Could not load tour details.";
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        // Handle ID from window location if params empty (fallback)
        if (!tourId) {
            const pathParts = window.location.pathname.split("/");
            const idIndex = pathParts.indexOf("tours") + 1;
            if (idIndex > 0 && idIndex < pathParts.length) {
                tourId = pathParts[idIndex];
            }
        }
        fetchTour();

        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    });

    function handleKeydown(e) {
        if (!isGalleryOpen) return;
        if (e.key === "Escape") closeGallery();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
    }

    function openGallery(index) {
        currentImageIndex = index;
        isGalleryOpen = true;
        document.body.style.overflow = "hidden";
    }

    function closeGallery() {
        isGalleryOpen = false;
        document.body.style.overflow = "";
    }

    function nextImage(e) {
        if (e) e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % allImages.length;
    }

    function prevImage(e) {
        if (e) e.stopPropagation();
        currentImageIndex =
            (currentImageIndex - 1 + allImages.length) % allImages.length;
    }

    function formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
</script>

<div
    class="min-h-screen bg-white"
    in:fly={{ y: 20, duration: 400, delay: 200 }}
>
    <!-- Navigation Header -->
    <div class="container mx-auto px-4 py-4">
        <button
            on:click={() =>
                window.dispatchEvent(
                    new CustomEvent("app:navigate", { detail: "/tours" }),
                )}
            class="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium transition-colors"
        >
            <div
                class="p-2 rounded-full bg-slate-100 group-hover:bg-emerald-100 transition-colors"
            >
                <ArrowLeft size={20} />
            </div>
            Back to Tours
        </button>
    </div>

    {#if isLoading}
        <div class="flex justify-center items-center h-[60vh]">
            <div
                class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"
            ></div>
        </div>
    {:else if error || !tour}
        <div class="container mx-auto px-4 py-20 text-center">
            <h2 class="text-2xl font-bold text-slate-800 mb-4">
                {error || "Tour not found"}
            </h2>
            <a
                href="/tours"
                class="text-emerald-600 font-medium hover:underline"
                >Back to Tours</a
            >
        </div>
    {:else}
        <!-- Hero Gallery -->
        <div class="container mx-auto px-4 pt-6 pb-8">
            <div
                class="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px] mb-8"
            >
                <!-- Main Image -->
                <div
                    class="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer"
                    on:click={() => openGallery(0)}
                >
                    <img
                        src={displayImages[0]?.url ||
                            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80"}
                        alt="Main"
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>
                <!-- Sub Images -->
                {#each displayImages.slice(1, 5) as img, i}
                    <div
                        class="relative rounded-2xl overflow-hidden group cursor-pointer hidden md:block"
                        on:click={() => openGallery(i + 1)}
                    >
                        <img
                            src={img.url}
                            alt="Gallery {i}"
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {#if i === 3 && allImages.length > 5}
                            <div
                                class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm"
                            >
                                +{allImages.length - 5} photos
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>

            <!-- Header Info -->
            <div
                class="flex flex-col md:flex-row gap-8 items-start justify-between mb-8"
            >
                <div class="flex-1">
                    <span
                        class="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-3"
                    >
                        {tour.duration}
                    </span>
                    <h1
                        class="text-3xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight"
                    >
                        {tour.name}
                    </h1>
                    <div
                        class="flex flex-wrap items-center gap-6 text-slate-500"
                    >
                        <div class="flex items-center gap-2">
                            <MapPin size={18} class="text-emerald-600" />
                            {#each tour.destinations as dest, i}
                                <span
                                    >{dest.name}{i <
                                    tour.destinations.length - 1
                                        ? " - "
                                        : ""}</span
                                >
                            {/each}
                        </div>
                    </div>
                </div>
                <div class="text-right hidden md:block">
                    <div class="text-sm text-slate-500 mb-1">
                        Price per person
                    </div>
                    <div class="text-3xl font-bold text-emerald-600">
                        {formatPrice(tour.price)}
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content + Sidebar -->
        <div class="container mx-auto px-4 pb-20">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <!-- Left Content -->
                <div class="lg:col-span-2 space-y-12">
                    <!-- Quick Stats -->
                    <div
                        class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl"
                    >
                        <div class="space-y-1">
                            <div
                                class="flex items-center gap-2 text-slate-500 text-sm"
                            >
                                <Clock size={16} /> Duration
                            </div>
                            <div class="font-semibold text-slate-900">
                                {tour.duration}
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div
                                class="flex items-center gap-2 text-slate-500 text-sm"
                            >
                                <Users size={16} /> Group Size
                            </div>
                            <div class="font-semibold text-slate-900">
                                Max {tour.totalSlots}
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div
                                class="flex items-center gap-2 text-slate-500 text-sm"
                            >
                                <Plane size={16} /> Transport
                            </div>
                            <div class="font-semibold text-slate-900">
                                Flight + Bus
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div
                                class="flex items-center gap-2 text-slate-500 text-sm"
                            >
                                <Calendar size={16} /> Start
                            </div>
                            <div class="font-semibold text-slate-900">
                                {new Date(tour.timeStart).toLocaleDateString(
                                    "vi-VN",
                                )}
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div>
                        <h3 class="text-2xl font-bold text-slate-900 mb-4">
                            About this tour
                        </h3>
                        <p
                            class="text-slate-600 leading-relaxed text-lg whitespace-pre-line"
                        >
                            {tour.description}
                        </p>
                    </div>

                    <!-- Itinerary (Mock) -->
                    <div>
                        <h3 class="text-2xl font-bold text-slate-900 mb-6">
                            Itinerary
                        </h3>
                        <div
                            class="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2"
                        >
                            {#each tour.destinations as dest, i}
                                <div class="relative">
                                    <div
                                        class="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-md"
                                    ></div>
                                    <h4
                                        class="text-xl font-bold text-slate-900 mb-2"
                                    >
                                        Stop {i + 1}: {dest.country} - {dest.name}
                                    </h4>
                                    <p
                                        class="text-slate-600 leading-relaxed mb-4"
                                    >
                                        {dest.description}
                                    </p>
                                    {#if dest.images && dest.images.length > 0}
                                        <div
                                            class="grid grid-cols-2 gap-3 mb-4 rounded-xl overflow-hidden"
                                        >
                                            {#each dest.images.slice(0, 2) as img}
                                                <img
                                                    src={img.url}
                                                    alt={dest.name}
                                                    class="w-full h-32 object-cover"
                                                />
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>

                    <!-- Policies -->
                    <div
                        class="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm"
                    >
                        <h3
                            class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                        >
                            <Shield size={24} class="text-emerald-600" />
                            Important Notes
                        </h3>
                        <ul class="space-y-3">
                            <li class="flex items-start gap-3 text-slate-600">
                                <CheckCircle2
                                    size={20}
                                    class="text-emerald-500 shrink-0 mt-0.5"
                                />
                                <span
                                    >Price includes accommodation in 4-star
                                    hotels.</span
                                >
                            </li>
                            <li class="flex items-start gap-3 text-slate-600">
                                <CheckCircle2
                                    size={20}
                                    class="text-emerald-500 shrink-0 mt-0.5"
                                />
                                <span>Visa application support included.</span>
                            </li>
                            <li class="flex items-start gap-3 text-slate-600">
                                <CheckCircle2
                                    size={20}
                                    class="text-emerald-500 shrink-0 mt-0.5"
                                />
                                <span>Flights and transfers included.</span>
                            </li>
                            <li class="flex items-start gap-3 text-slate-600">
                                <Info
                                    size={20}
                                    class="text-slate-400 shrink-0 mt-0.5"
                                />
                                <span
                                    >Personal expenses and tips are not
                                    included.</span
                                >
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Right Sidebar (Sticky) -->
                <div class="lg:col-span-1">
                    <div
                        class="sticky top-24 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                        <div class="p-6 bg-slate-900 text-white">
                            <div class="text-sm opacity-80 mb-1">
                                Start from
                            </div>
                            <div class="flex items-baseline gap-1">
                                <span class="text-3xl font-bold"
                                    >{formatPrice(tour.price)}</span
                                >
                                <span class="text-sm opacity-80">/ person</span>
                            </div>
                        </div>

                        <div class="p-6 space-y-6">
                            <!-- Date Selection -->
                            <div class="space-y-2">
                                <label
                                    class="text-sm font-semibold text-slate-900"
                                    >Departure Date</label
                                >
                                <div
                                    class="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3 text-slate-700"
                                >
                                    <Calendar
                                        size={18}
                                        class="text-slate-400"
                                    />
                                    <span class="font-medium"
                                        >{formatDate(tour.timeStart)}</span
                                    >
                                </div>
                            </div>

                            <!-- Guests -->
                            <div class="space-y-2">
                                <label
                                    class="text-sm font-semibold text-slate-900"
                                    >Travelers</label
                                >
                                <div
                                    class="flex items-center border border-slate-200 rounded-xl overflow-hidden"
                                >
                                    <button
                                        class="p-3 hover:bg-slate-50 text-slate-600 disabled:opacity-50"
                                        disabled={guests <= 1}
                                        on:click={() => guests--}>-</button
                                    >
                                    <input
                                        type="number"
                                        bind:value={guests}
                                        min="1"
                                        max={tour.availableSlots}
                                        class="flex-1 text-center font-bold text-slate-900 outline-none"
                                    />
                                    <button
                                        class="p-3 hover:bg-slate-50 text-slate-600 disabled:opacity-50"
                                        disabled={guests >= tour.availableSlots}
                                        on:click={() => guests++}>+</button
                                    >
                                </div>
                                <div class="text-xs text-slate-500 text-right">
                                    {tour.availableSlots} slots remaining
                                </div>
                            </div>

                            <!-- Total -->
                            <div
                                class="pt-4 border-t border-slate-100 flex justify-between items-center"
                            >
                                <span class="font-semibold text-slate-900"
                                    >Total</span
                                >
                                <span class="text-xl font-bold text-emerald-600"
                                    >{formatPrice(totalPrice)}</span
                                >
                            </div>

                            <!-- Action -->
                            <button
                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                            >
                                Book Now
                            </button>

                            <div class="text-center text-xs text-slate-400">
                                No payment charged yet
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Lightbox Modal -->
    {#if isGalleryOpen}
        <div
            class="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            transition:fade={{ duration: 200 }}
            on:click={closeGallery}
        >
            <!-- Close Button -->
            <button
                class="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                on:click={closeGallery}
            >
                <X size={32} />
            </button>

            <!-- Navigation Buttons -->
            <button
                class="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:block"
                on:click={prevImage}
            >
                <ChevronLeft size={40} />
            </button>

            <button
                class="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden md:block"
                on:click={nextImage}
            >
                <ChevronRight size={40} />
            </button>

            <!-- Main Image -->
            <div
                class="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
                on:click|stopPropagation
            >
                <img
                    src={allImages[currentImageIndex]?.url}
                    alt="Gallery view"
                    class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />

                <!-- Counter -->
                <div
                    class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm font-medium backdrop-blur-md"
                >
                    {currentImageIndex + 1} / {allImages.length}
                </div>
            </div>
        </div>
    {/if}
</div>

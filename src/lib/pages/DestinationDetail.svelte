<script>
    import { onMount } from "svelte";
    import { api } from "../api.svelte";
    import {
        MapPin,
        Clock,
        Users,
        Star,
        ArrowRight,
        Home,
        Globe,
        ChevronRight,
        Loader2,
    } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";
    import ErrorPage from "./ErrorPage.svelte";

    export let params = {};
    let destinationId = "";
    let destination = null;
    let isLoading = true;
    let error = "";

    // Derived
    $: if (params && params.id) destinationId = params.id;

    async function fetchDestination() {
        if (!destinationId) return;
        isLoading = true;
        try {
            const res = await api.getDestination(destinationId);
            destination = res.data;
        } catch (err) {
            console.error(err);
            error = "Không thể tải thông tin điểm đến.";
        } finally {
            isLoading = false;
        }
    }

    function navigate(path) {
        window.dispatchEvent(new CustomEvent("app:navigate", { detail: path }));
    }

    function formatPrice(price) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    }

    onMount(() => {
        // Fallback for ID extraction if params not passed via props (e.g. direct load logic)
        if (!destinationId) {
            const pathParts = window.location.pathname.split("/");
            // assumes /destinations/:id
            if (pathParts[pathParts.length - 1]) {
                destinationId = pathParts[pathParts.length - 1];
            }
        }
        fetchDestination();
    });
</script>

<div class="min-h-screen bg-white font-sans">
    {#if isLoading}
        <div class="flex justify-center items-center h-screen">
            <Loader2 class="w-12 h-12 text-emerald-600 animate-spin" />
        </div>
    {:else if error || !destination}
        <ErrorPage
            code={404}
            title="Không tìm thấy"
            message={error || "Điểm đến không tồn tại"}
        />
    {:else}
        <!-- A. Hero Section -->
        <div class="relative h-[60vh] w-full overflow-hidden">
            <!-- Background Image -->
            <img
                src={destination.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80"}
                alt={destination.name}
                class="absolute inset-0 w-full h-full object-cover"
            />

            <!-- Gradient Overlay -->
            <div
                class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
            ></div>

            <!-- Content -->
            <div class="absolute bottom-0 left-0 w-full p-8 md:p-16">
                <div class="container mx-auto">
                    <!-- Breadcrumb -->
                    <div
                        class="flex items-center gap-2 text-white/80 text-sm mb-4 font-medium backdrop-blur-sm bg-black/20 inline-flex px-4 py-2 rounded-full"
                    >
                        <button
                            on:click={() => navigate("/")}
                            class="hover:text-emerald-400 transition-colors flex items-center gap-1"
                        >
                            <Home size={14} /> Trang chủ
                        </button>
                        <ChevronRight size={14} />
                        <button
                            on:click={() => navigate("/destinations")}
                            class="hover:text-emerald-400 transition-colors"
                        >
                            Điểm đến
                        </button>
                        <ChevronRight size={14} />
                        <span class="text-white">{destination.country}</span>
                        <ChevronRight size={14} />
                        <span class="text-emerald-400">{destination.name}</span>
                    </div>

                    <h1
                        class="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg"
                    >
                        {destination.name}
                    </h1>

                    <div
                        class="flex items-center gap-3 text-white/90 text-xl font-medium"
                    >
                        <span class="text-2xl">🇩🇪</span>
                        <!-- Using generic flag or fetch from country map if needed, for now standard emoji as requested fallback concept -->
                        <span>{destination.country}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- B. Overview Section -->
        <div class="container mx-auto px-4 py-16">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <!-- Left: Description -->
                <div class="lg:col-span-2">
                    <h2
                        class="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3"
                    >
                        <Globe class="text-emerald-600" />
                        Giới thiệu chung
                    </h2>
                    <p
                        class="text-slate-600 text-lg leading-loose font-light text-justify"
                    >
                        {destination.description}
                    </p>
                </div>

                <!-- Right: Mini Gallery -->
                <div class="lg:col-span-1">
                    <h3 class="text-xl font-bold text-slate-900 mb-6">
                        Thư viện ảnh
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        {#if destination.images && destination.images.length > 1}
                            {#each destination.images.slice(1, 5) as img, i}
                                <div
                                    class="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                                >
                                    <img
                                        src={img.url}
                                        alt="{destination.name} {i}"
                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            {/each}
                        {:else}
                            <div
                                class="col-span-2 text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400"
                            >
                                Chưa có thêm ảnh nào
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- C. Related Tours Section -->
        <div class="bg-slate-50 py-20">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between mb-12">
                    <div>
                        <h2
                            class="text-3xl md:text-4xl font-bold text-slate-900 mb-2"
                        >
                            Các tour đi qua {destination.name}
                        </h2>
                        <p class="text-slate-500 text-lg">
                            Khám phá {destination.name} với các lịch trình được yêu
                            thích nhất
                        </p>
                    </div>
                </div>

                {#if destination.topTours && destination.topTours.length > 0}
                    <div class="space-y-6">
                        {#each destination.topTours as tour, i}
                            <!-- Horizontal Tour Card -->
                            <div
                                class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col md:flex-row group"
                                in:fly={{
                                    y: 20,
                                    duration: 400,
                                    delay: i * 100,
                                }}
                            >
                                <!-- Image (Left) -->
                                <div
                                    class="w-full md:w-1/3 lg:w-1/4 relative overflow-hidden h-64 md:h-auto"
                                >
                                    <!-- Fallback to destination image since tour might not have one in topTours schema yet, 
                                         or use provided tour.image if available in future -->
                                    <img
                                        src={destination.images?.[0]?.url}
                                        alt={tour.name}
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div
                                        class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-700"
                                    >
                                        Best Seller
                                    </div>
                                </div>

                                <!-- Info (Middle) -->
                                <div
                                    class="flex-1 p-6 md:p-8 flex flex-col justify-center border-r border-slate-50"
                                >
                                    <div class="flex items-center gap-2 mb-2">
                                        <Star
                                            size={16}
                                            class="fill-yellow-400 text-yellow-400"
                                        />
                                        <span class="font-bold text-slate-800"
                                            >{tour.ratingAverage || 5.0}</span
                                        >
                                        <span class="text-slate-400 text-sm"
                                            >(Excellent)</span
                                        >
                                    </div>

                                    <h3
                                        class="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors"
                                    >
                                        {tour.name}
                                    </h3>

                                    <div
                                        class="flex flex-wrap items-center gap-6 text-slate-500 text-sm font-medium"
                                    >
                                        <div class="flex items-center gap-2">
                                            <Clock
                                                size={18}
                                                class="text-emerald-500"
                                            />
                                            {tour.duration}
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Users
                                                size={18}
                                                class="text-emerald-500"
                                            />
                                            {#if tour.availableSlots > 5}
                                                <span
                                                    class="text-green-600 bg-green-50 px-2 py-1 rounded-md"
                                                >
                                                    Còn {tour.availableSlots} chỗ
                                                </span>
                                            {:else if tour.availableSlots > 0}
                                                <span
                                                    class="text-red-600 bg-red-50 px-2 py-1 rounded-md"
                                                >
                                                    Chỉ còn {tour.availableSlots}
                                                    chỗ
                                                </span>
                                            {:else}
                                                <span
                                                    class="text-slate-400 bg-slate-100 px-2 py-1 rounded-md"
                                                >
                                                    Hết chỗ
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>

                                <!-- Price & Action (Right) -->
                                <div
                                    class="w-full md:w-72 p-6 md:p-8 bg-slate-50 flex flex-col justify-center items-center md:items-end gap-4 border-l border-slate-100"
                                >
                                    <div class="text-center md:text-right">
                                        <div
                                            class="text-slate-400 text-sm font-medium line-through mb-1"
                                        >
                                            {formatPrice(tour.price * 1.1)}
                                        </div>
                                        <div
                                            class="text-3xl font-bold text-rose-500"
                                        >
                                            {formatPrice(tour.price)}
                                        </div>
                                        <div
                                            class="text-slate-500 text-xs mt-1"
                                        >
                                            / khách
                                        </div>
                                    </div>

                                    <button
                                        on:click={() =>
                                            navigate(
                                                `/tours/${tour._id || tour.id}`,
                                            )}
                                        class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        Đặt ngay
                                        <ArrowRight
                                            size={18}
                                            class="group-hover/btn:translate-x-1 transition-transform"
                                        />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div
                        class="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100"
                    >
                        <MapPin size={48} class="mx-auto text-slate-300 mb-4" />
                        <h3 class="text-xl font-bold text-slate-700 mb-2">
                            Chưa có tour nào
                        </h3>
                        <p class="text-slate-500">
                            Hiện tại chưa có tour nào đi qua địa điểm này.
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

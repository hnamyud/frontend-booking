<script>
    import { fly, fade } from "svelte/transition";
    import { Search, Calendar, Wallet, MapPin } from "lucide-svelte";

    let location = "";
    let date = "";
    let budget = "";

    function handleSearch() {
        const params = new URLSearchParams();
        params.set("current", "1");
        params.set("pageSize", "10");
        params.set("sort", "-price");

        if (location) params.set("destinationName", location);
        if (date) params.set("timeStart_from", date);

        if (budget) {
            switch (budget) {
                case "under-5":
                    params.set("priceMax", "5000000");
                    break;
                case "5-10":
                    params.set("priceMin", "5000000");
                    params.set("priceMax", "10000000");
                    break;
                case "10-20":
                    params.set("priceMin", "10000000");
                    params.set("priceMax", "20000000");
                    break;
                case "over-20":
                    params.set("priceMin", "20000000");
                    break;
            }
        }

        window.dispatchEvent(
            new CustomEvent("app:navigate", {
                detail: "/tours?" + params.toString(),
            }),
        );
    }
</script>

<section
    id="home"
    class="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
>
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
        <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
            alt="Mountain Landscape"
            class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-4 text-center text-white">
        <h1
            in:fly={{ y: 50, duration: 1000, delay: 200 }}
            class="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
            Discover Your Next <br />
            <span class="text-emerald-400">Adventure</span>
        </h1>

        <p
            in:fly={{ y: 30, duration: 1000, delay: 400 }}
            class="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto"
        >
            Explore the world's most breathtaking destinations with our curated
            travel experiences.
        </p>

        <!-- Search Box -->
        <div
            in:fly={{ y: 30, duration: 1000, delay: 600 }}
            class="bg-white p-4 rounded-2xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center"
        >
            <div class="flex-1 w-full relative group">
                <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
                >
                    <MapPin size={20} />
                </div>
                <input
                    type="text"
                    bind:value={location}
                    placeholder="Where to?"
                    class="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800 placeholder-gray-400"
                />
            </div>

            <div class="flex-1 w-full relative group">
                <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
                >
                    <Calendar size={20} />
                </div>
                <input
                    type="date"
                    bind:value={date}
                    class="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800"
                />
            </div>

            <div class="flex-1 w-full relative group">
                <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors"
                >
                    <Wallet size={20} />
                </div>
                <select
                    bind:value={budget}
                    class="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800 appearance-none cursor-pointer"
                >
                    <option value="" disabled selected>Chọn mức giá</option>
                    <option value="under-5">Dưới 5 triệu</option>
                    <option value="5-10">Từ 5 đến 10 triệu</option>
                    <option value="10-20">Từ 10 đến 20 triệu</option>
                    <option value="over-20">Trên 20 triệu</option>
                </select>
            </div>

            <button
                on:click={handleSearch}
                class="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
                <Search size={20} />
                <span>Search</span>
            </button>
        </div>
    </div>
</section>

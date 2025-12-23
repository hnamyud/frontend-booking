<script>
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { Map, Compass, Home, ArrowLeft } from "lucide-svelte";

    export let code = 404;
    export let title = "Không tìm thấy trang";
    export let message =
        "Có vẻ như bạn đã đi lạc. Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.";

    // Check if we are in a "Tour Deleted" context
    export let isTourError = false;

    if (isTourError) {
        title = "Chuyến đi không tồn tại";
        message =
            "Tour du lịch này có thể đã kết thúc hoặc bị gỡ bỏ khỏi hệ thống.";
    }

    function goHome() {
        window.dispatchEvent(new CustomEvent("app:navigate", { detail: "/" }));
    }

    function goBack() {
        window.history.back();
    }
</script>

<div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-emerald-900 flex items-center justify-center p-4 overflow-hidden relative"
    in:fade={{ duration: 500 }}
>
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
            class="absolute top-[10%] left-[10%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse"
        ></div>
        <div
            class="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-1000"
        ></div>

        <!-- Decorative Grid -->
        <div
            class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQwIDBIMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"
        ></div>
    </div>

    <!-- Main Content Card -->
    <div
        class="relative max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 text-center"
        in:fly={{ y: 50, duration: 800, delay: 200 }}
    >
        <!-- Floating Icon -->
        <div class="relative inline-block mb-8">
            <div
                class="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full"
            ></div>
            <div
                class="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 group hover:rotate-0 transition-transform duration-500"
            >
                {#if code === 404}
                    <Compass size={48} class="text-white drop-shadow-md" />
                {:else}
                    <Map size={48} class="text-white drop-shadow-md" />
                {/if}
            </div>
            <!-- Decorative dots -->
            <div
                class="absolute -top-4 -right-4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-300"
            ></div>
            <div
                class="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce"
            ></div>
        </div>

        <!-- Typography -->
        <h1
            class="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2 font-mono tracking-tighter"
        >
            {code}
        </h1>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
            {title}
        </h2>
        <p class="text-sky-100/80 mb-10 text-lg leading-relaxed">
            {message}
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
                on:click={goBack}
                class="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2 group"
            >
                <ArrowLeft
                    size={18}
                    class="group-hover:-translate-x-1 transition-transform"
                />
                Quay lại
            </button>
            <button
                on:click={goHome}
                class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
                <Home size={18} />
                Trang chủ
            </button>
        </div>
    </div>
</div>

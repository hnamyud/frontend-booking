<script>
    export let image;
    export let title;
    export let price;
    export let rating;
</script>

<div
    class="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-2"
>
    <div class="aspect-[4/5] w-full overflow-hidden">
        <img
            src={image}
            alt={title}
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
    </div>

    <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"
    ></div>

    <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-bold font-sans">{title}</h3>
            <div
                class="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full"
            >
                <span class="text-yellow-400">★</span>
                <span class="text-sm font-medium">{rating}</span>
            </div>
        </div>

        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-300">Starting from</p>
            <p class="text-lg font-bold text-emerald-400">${price}</p>
        </div>
    </div>
</div>

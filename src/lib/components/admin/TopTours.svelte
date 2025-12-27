<script lang="ts">
    import { Trophy, Medal, Award } from "lucide-svelte";

    interface TopTour {
        tourId: string;
        tourName: string[];
        totalBookings: number;
        totalParticipants: number;
        totalRevenue: number;
    }

    export let tours: TopTour[] = [];

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    }
</script>

<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
    <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Trophy class="text-yellow-500" size={20} />
        Top Tour Bán Chạy
    </h3>

    <div class="flex flex-col gap-4">
        {#each tours as tour, index}
            <div
                class="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <!-- Rank Icon -->
                <div class="flex-shrink-0 w-8 flex justify-center">
                    {#if index === 0}
                        <Trophy
                            class="text-yellow-500 fill-yellow-100"
                            size={24}
                        />
                    {:else if index === 1}
                        <Medal
                            class="text-slate-400 fill-slate-100"
                            size={24}
                        />
                    {:else if index === 2}
                        <Award
                            class="text-amber-700 fill-amber-100"
                            size={24}
                        />
                    {:else}
                        <span
                            class="text-slate-400 font-bold text-lg w-6 h-6 flex items-center justify-center border border-slate-200 rounded-full text-sm"
                        >
                            {index + 1}
                        </span>
                    {/if}
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                    <h4
                        class="font-medium text-slate-800 truncate"
                        title={Array.isArray(tour.tourName)
                            ? tour.tourName[0]
                            : tour.tourName}
                    >
                        {Array.isArray(tour.tourName)
                            ? tour.tourName[0]
                            : tour.tourName || "Tên tour không xác định"}
                    </h4>
                    <p class="text-xs text-slate-500 mt-1">
                        {tour.totalBookings} bookings • {tour.totalParticipants}
                        khách
                    </p>
                </div>

                <!-- Revenue -->
                <div class="text-right flex-shrink-0">
                    <div class="font-bold text-emerald-600 text-sm">
                        {formatCurrency(tour.totalRevenue)}
                    </div>
                </div>
            </div>
        {/each}

        {#if tours.length === 0}
            <div class="text-center text-slate-400 py-8">
                Chưa có dữ liệu tour bán chạy
            </div>
        {/if}
    </div>
</div>

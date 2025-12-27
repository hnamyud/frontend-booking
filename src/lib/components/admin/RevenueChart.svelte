<script lang="ts">
    import { onMount } from "svelte";

    // Props
    export let data: { date: string; revenue: number }[] = [];

    // Internal state
    let chartData: { label: string; value: number; heightPercent: number }[] =
        [];
    let maxRevenue = 0;

    $: if (data.length > 0) {
        processData();
    }

    function processData() {
        // 1. Group by date (month) to handle duplicates
        const revenueByMonth: Record<string, number> = {};

        data.forEach((item) => {
            if (revenueByMonth[item.date]) {
                revenueByMonth[item.date] += item.revenue;
            } else {
                revenueByMonth[item.date] = item.revenue;
            }
        });

        // 2. Convert to array and sort by date
        const sortedKeys = Object.keys(revenueByMonth).sort();

        // 3. Calculate max for scaling
        const rawData = sortedKeys.map((date) => ({
            label: date,
            value: revenueByMonth[date],
        }));

        maxRevenue = Math.max(...rawData.map((d) => d.value));

        // Avoid division by zero
        const scaleMax = maxRevenue > 0 ? maxRevenue : 1;

        // 4. Transform for view
        chartData = rawData.map((item) => ({
            ...item,
            heightPercent: (item.value / scaleMax) * 100,
        }));
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    }
</script>

<div
    class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col"
>
    <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-slate-800">
            Biểu đồ tăng trưởng doanh thu
        </h3>
        <div
            class="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full"
        >
            6 tháng gần nhất
        </div>
    </div>

    <!-- Chart Container -->
    <div
        class="flex-1 flex items-end gap-2 sm:gap-4 min-h-[300px] border-b border-slate-200 pb-2 relative"
    >
        {#if chartData.length === 0}
            <div
                class="absolute inset-0 flex items-center justify-center text-slate-400"
            >
                Chưa có dữ liệu
            </div>
        {/if}

        {#each chartData as bar}
            <div
                class="flex-1 flex flex-col items-center group relative h-full justify-end"
            >
                <!-- Tooltip -->
                <div
                    class="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap z-10"
                >
                    {formatCurrency(bar.value)}
                </div>

                <!-- Bar -->
                <div
                    class="w-full max-w-[40px] bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all duration-300 relative"
                    style="height: {bar.heightPercent}%; min-height: 4px;"
                >
                    <!-- Highlight for duplicate month data point if relevant, showing subtle gradient -->
                    <div
                        class="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-50 rounded-t-md"
                    ></div>
                </div>

                <!-- Label -->
                <div
                    class="mt-3 text-xs text-slate-500 font-medium rotate-0 truncate w-full text-center"
                >
                    {bar.label.slice(5)}
                    <!-- Show only MM from YYYY-MM -->
                </div>
            </div>
        {/each}
    </div>
</div>

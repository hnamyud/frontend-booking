<script lang="ts">
    import { onMount } from "svelte";
    import { api } from "../../api.svelte";
    import OverviewCards from "./OverviewCards.svelte";
    import RevenueChart from "./RevenueChart.svelte";
    import TopTours from "./TopTours.svelte";

    let loading = true;
    let overviewStats = {
        revenue: 0,
        bookings: 0,
        tours: 0,
        users: 0,
    };
    let chartData: any[] = [];
    let topTours: any[] = [];

    onMount(async () => {
        try {
            loading = true;
            const [overviewRes, chartRes, topToursRes] = await Promise.all([
                api.getOverviewStats(),
                api.getRevenueChart(),
                api.getTopTours(5),
            ]);

            if (overviewRes && overviewRes.data) {
                // Safely merge to ensure defaults are kept if API returns partial object
                overviewStats = { ...overviewStats, ...overviewRes.data };
            }

            if (chartRes && (chartRes.data || Array.isArray(chartRes))) {
                const data = chartRes.data || chartRes;
                chartData = Array.isArray(data) ? data : [];
            }

            if (
                topToursRes &&
                (topToursRes.data || Array.isArray(topToursRes))
            ) {
                const data = topToursRes.data || topToursRes;
                topTours = Array.isArray(data) ? data : [];
            }
        } catch (error) {
            console.error("Failed to load dashboard stats:", error);
        } finally {
            loading = false;
        }
    });
</script>

<div class="space-y-6">
    <!-- Overview Cards -->
    {#if loading}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
            <div class="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
            <div class="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
            <div class="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
                class="lg:col-span-2 h-[400px] bg-slate-100 rounded-2xl animate-pulse"
            ></div>
            <div class="h-[400px] bg-slate-100 rounded-2xl animate-pulse"></div>
        </div>
    {:else}
        <OverviewCards stats={overviewStats} />

        <!-- Asymmetrical Layout: Chart (70%) - Top Tours (30%) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Revenue Chart -->
            <div class="lg:col-span-2 h-[400px]">
                <RevenueChart data={chartData} />
            </div>

            <!-- Right Column: Top Tours -->
            <div class="h-[400px]">
                <TopTours tours={topTours} />
            </div>
        </div>
    {/if}
</div>

<script lang="ts">
    import { CreditCard, Calendar, Compass, Users } from "lucide-svelte";

    export let stats = {
        revenue: 0,
        bookings: 0,
        tours: 0,
        users: 0,
    };

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div
        class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4"
    >
        <div
            class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"
        >
            <CreditCard size={24} />
        </div>
        <div>
            <p class="text-slate-500 text-sm">Tổng Doanh thu</p>
            <h3 class="text-xl font-bold text-slate-800">
                {formatCurrency(stats.revenue)}
            </h3>
        </div>
    </div>

    <div
        class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4"
    >
        <div
            class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
        >
            <Calendar size={24} />
        </div>
        <div>
            <p class="text-slate-500 text-sm">Tổng Booking</p>
            <h3 class="text-xl font-bold text-slate-800">{stats.bookings}</h3>
        </div>
    </div>

    <div
        class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4"
    >
        <div
            class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"
        >
            <Compass size={24} />
        </div>
        <div>
            <p class="text-slate-500 text-sm">Tổng Tour</p>
            <h3 class="text-xl font-bold text-slate-800">{stats.tours}</h3>
        </div>
    </div>

    <div
        class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4"
    >
        <div
            class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"
        >
            <Users size={24} />
        </div>
        <div>
            <p class="text-slate-500 text-sm">Tổng User</p>
            <h3 class="text-xl font-bold text-slate-800">{stats.users}</h3>
        </div>
    </div>
</div>

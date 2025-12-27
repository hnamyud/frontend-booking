<script>
    import { auth } from "../stores/auth";
    import { onMount } from "svelte";
    import {
        Users,
        Map,
        Compass,
        Calendar,
        Star,
        CreditCard,
        Settings,
        LayoutDashboard,
        User,
    } from "lucide-svelte";
    import DestinationsTab from "../components/admin/DestinationsTab.svelte";
    import UsersTab from "../components/admin/UsersTab.svelte";
    import ToursTab from "../components/admin/ToursTab.svelte";
    import BookingsTab from "../components/admin/BookingsTab.svelte";
    import PaymentsTab from "../components/admin/PaymentsTab.svelte";
    import ReviewsTab from "../components/admin/ReviewsTab.svelte";
    import ModeratorStats from "../components/admin/ModeratorStats.svelte";
    import { BarChart3 } from "lucide-svelte"; // Icon for Overview

    let activeTab = "overview"; // Default to overview

    onMount(() => {
        // Must be authenticated and either Admin or Moderator
        if (!$auth.isAuthenticated || (!$auth.isAdmin && !$auth.isModerator)) {
            window.location.href = "/";
        }
    });

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "users", label: "Users", icon: Users },
        { id: "destinations", label: "Destinations", icon: Map },
        { id: "tours", label: "Tours", icon: Compass },
        { id: "bookings", label: "Bookings", icon: Calendar },
        { id: "reviews", label: "Reviews", icon: Star },
        { id: "payments", label: "Payments", icon: CreditCard },
    ];
</script>

<div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div class="p-6 border-b border-slate-100">
            <div class="flex items-center gap-2 text-emerald-600">
                <LayoutDashboard size={24} />
                <span class="text-xl font-bold">Mod Panel</span>
            </div>
        </div>

        <nav class="p-4 space-y-2">
            {#each tabs as tab}
                <button
                    on:click={() => (activeTab = tab.id)}
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all {activeTab ===
                    tab.id
                        ? 'bg-emerald-50 text-emerald-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'}"
                >
                    <svelte:component this={tab.icon} size={20} />
                    <span>{tab.label}</span>
                </button>
            {/each}
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 flex-1 p-8">
        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-slate-800 capitalize">
                    {activeTab} Management
                </h1>
                <p class="text-slate-500">
                    Manage system {activeTab} here.
                </p>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <div class="font-medium text-slate-800">
                        {$auth.user?.name}
                    </div>
                    <div class="text-sm text-emerald-600">
                        {#if $auth.isAdmin}Administrator{/if}
                        {#if $auth.isAdmin && $auth.isModerator}
                            &
                        {/if}
                        {#if $auth.isModerator}Moderator{/if}
                    </div>
                </div>
                <div
                    class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold"
                >
                    {$auth.user?.name?.[0] || "M"}
                </div>
            </div>
        </header>

        <div
            class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[500px]"
        >
            {#if activeTab === "overview"}
                <ModeratorStats />
            {:else if activeTab === "destinations"}
                <DestinationsTab />
            {:else if activeTab === "users"}
                <UsersTab />
            {:else if activeTab === "tours"}
                <ToursTab />
            {:else if activeTab === "bookings"}
                <BookingsTab />
            {:else if activeTab === "payments"}
                <PaymentsTab />
            {:else if activeTab === "reviews"}
                <ReviewsTab />
            {:else}
                <div
                    class="flex items-center justify-center h-full text-slate-400 flex-col gap-4"
                >
                    <Settings size={48} class="opacity-20" />
                    <p>Content for {activeTab} management will go here.</p>
                </div>
            {/if}
        </div>
    </main>
</div>

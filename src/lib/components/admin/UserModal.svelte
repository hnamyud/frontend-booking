<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import {
        X,
        Save,
        User,
        Mail,
        Lock,
        Calendar,
        MapPin,
        Shield,
    } from "lucide-svelte";

    export let isOpen = false;
    export let userData = null; // Renamed from user to avoid conflict
    export let isLoading = false;

    const dispatch = createEventDispatcher();

    let form = {
        name: "",
        email: "",
        password: "",
        birthDay: "",
        gender: "MALE",
        address: "",
        role: "USER",
    };

    let error = "";

    onMount(() => {
        if (userData) {
            // Edit mode
            try {
                form = {
                    name: userData.name || "",
                    email: userData.email || "",
                    password: "", // Password not editable here
                    birthDay: userData.birthDay
                        ? formatDateForInput(userData.birthDay)
                        : "",
                    gender: userData.gender || "MALE",
                    address: userData.address || "",
                    role: userData.role || "USER",
                };
            } catch (e) {
                console.error("Error initializing form:", e);
                error = "Failed to load user data";
            }
        } else {
            // Create mode
            resetForm();
        }
    });

    function resetForm() {
        form = {
            name: "",
            email: "",
            password: "",
            birthDay: "",
            gender: "MALE",
            address: "",
            role: "USER",
        };
        error = "";
    }

    function formatDateForInput(isoString) {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return "";
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error("Error formatting date:", e);
            return "";
        }
    }

    function formatDateForAPI(dateString) {
        if (!dateString) return null;
        // Ensure format is YYYY-MM-DD
        return dateString;
    }

    function handleSubmit() {
        if (!form.name || !form.email) {
            error = "Name and Email are required";
            return;
        }

        if (!userData && !form.password) {
            error = "Password is required for new users";
            return;
        }

        const payload = {
            name: form.name,
            email: form.email,
            birthDay: form.birthDay ? formatDateForAPI(form.birthDay) : null,
            gender: form.gender,
            address: form.address,
            role: form.role,
        };

        if (!userData) {
            payload.password = form.password;
        }

        dispatch("submit", payload);
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
            <div
                class="p-6 border-b border-slate-100 flex justify-between items-center"
            >
                <h3 class="text-xl font-bold text-slate-800">
                    {userData ? "Edit User" : "Add New User"}
                </h3>
                <button
                    on:click={() => dispatch("close")}
                    class="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div class="p-6 overflow-y-auto flex-1 space-y-6">
                {#if error}
                    <div class="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                {/if}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Name -->
                    <div class="space-y-2">
                        <label
                            for="name"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <User size={16} /> Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            bind:value={form.name}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <!-- Email -->
                    <div class="space-y-2">
                        <label
                            for="email"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <Mail size={16} /> Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            bind:value={form.email}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>

                    <!-- Password (Create Only) -->
                    {#if !userData}
                        <div class="space-y-2 md:col-span-2">
                            <label
                                for="password"
                                class="text-sm font-medium text-slate-700 flex items-center gap-2"
                            >
                                <Lock size={16} /> Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                bind:value={form.password}
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    {/if}

                    <!-- Birthday -->
                    <div class="space-y-2">
                        <label
                            for="birthDay"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <Calendar size={16} /> Birthday
                        </label>
                        <input
                            id="birthDay"
                            type="date"
                            bind:value={form.birthDay}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>

                    <!-- Gender -->
                    <div class="space-y-2">
                        <label
                            for="gender"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <User size={16} /> Gender
                        </label>
                        <select
                            id="gender"
                            bind:value={form.gender}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <!-- Address -->
                    <div class="space-y-2 md:col-span-2">
                        <label
                            for="address"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <MapPin size={16} /> Address
                        </label>
                        <input
                            id="address"
                            type="text"
                            bind:value={form.address}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="123 Street, City"
                        />
                    </div>

                    <!-- Role -->
                    <div class="space-y-2 md:col-span-2">
                        <label
                            for="role"
                            class="text-sm font-medium text-slate-700 flex items-center gap-2"
                        >
                            <Shield size={16} /> Role
                        </label>
                        <select
                            id="role"
                            bind:value={form.role}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            disabled={!!userData}
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        {#if userData}
                            <p class="text-xs text-slate-500">
                                Role cannot be changed while editing.
                            </p>
                        {/if}
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                    on:click={() => dispatch("close")}
                    class="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    on:click={handleSubmit}
                    disabled={isLoading}
                    class="px-6 py-2.5 rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {#if isLoading}
                        <div
                            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        ></div>
                        <span>Processing...</span>
                    {:else}
                        <Save size={18} />
                        <span>{userData ? "Update" : "Create"} User</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

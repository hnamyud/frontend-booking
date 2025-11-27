<script>
    import { onMount } from "svelte";
    import { auth } from "../../stores/auth";
    import { api } from "../../api.svelte";
    import {
        Pencil,
        Trash2,
        Plus,
        ChevronLeft,
        ChevronRight,
        User,
        Mail,
        Shield,
        Calendar,
    } from "lucide-svelte";
    import UserModal from "./UserModal.svelte";

    let users = [];
    let meta = {
        current: 1,
        pageSize: 10,
        pages: 1,
        total: 0,
    };
    let isLoading = false;
    let error = "";

    // Modal State
    let isModalOpen = false;
    let selectedUser = null;
    let isSubmitting = false;

    async function fetchUsers(page = 1) {
        isLoading = true;
        error = "";
        try {
            const data = await api.request(
                `/api/v1/user?current=${page}&pageSize=${meta.pageSize}`,
                "GET",
                undefined,
                { Authorization: `Bearer ${$auth.token}` },
            );

            users = data.data.result;
            meta = data.data.meta;
        } catch (err) {
            console.error(err);
            error = "Failed to fetch users";
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchUsers();
    });

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= meta.pages) {
            fetchUsers(newPage);
        }
    }

    function openCreateModal() {
        selectedUser = null;
        isModalOpen = true;
    }

    function openEditModal(user) {
        selectedUser = user;
        isModalOpen = true;
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await api.request(`/api/v1/user/${id}`, "DELETE", undefined, {
                Authorization: `Bearer ${$auth.token}`,
            });

            fetchUsers(meta.current);
        } catch (err) {
            console.error(err);
            alert("Error deleting user");
        }
    }

    async function handleSubmit(event) {
        const payload = event.detail;
        isSubmitting = true;

        try {
            const url = selectedUser
                ? `/api/v1/user/${selectedUser._id}`
                : "/api/v1/user";

            const method = selectedUser ? "PATCH" : "POST";

            await api.request(url, method, payload, {
                Authorization: `Bearer ${$auth.token}`,
            });

            isModalOpen = false;
            fetchUsers(meta.current);
        } catch (err) {
            console.error(err);
            alert(err.message || "An error occurred");
        } finally {
            isSubmitting = false;
        }
    }

    function formatDate(isoString) {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleDateString("vi-VN");
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-slate-800">User List</h3>
        <button
            on:click={openCreateModal}
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <Plus size={18} />
            <span>Add User</span>
        </button>
    </div>

    {#if isLoading}
        <div class="flex justify-center py-12">
            <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"
            ></div>
        </div>
    {:else if error}
        <div class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr
                        class="border-b border-slate-200 text-slate-500 text-sm"
                    >
                        <th class="py-4 px-4 font-medium">Name</th>
                        <th class="py-4 px-4 font-medium">Email</th>
                        <th class="py-4 px-4 font-medium">Role</th>
                        <th class="py-4 px-4 font-medium">Created At</th>
                        <th class="py-4 px-4 font-medium text-right">Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="text-slate-700">
                    {#each users as user}
                        <tr
                            class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                            <td class="py-4 px-4 font-medium">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold"
                                    >
                                        {user.name?.charAt(0).toUpperCase() ||
                                            "U"}
                                    </div>
                                    {user.name}
                                </div>
                            </td>
                            <td class="py-4 px-4 text-slate-500"
                                >{user.email}</td
                            >
                            <td class="py-4 px-4">
                                <span
                                    class={`px-3 py-1 rounded-full text-xs font-bold ${user.role === "ADMIN" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                                >
                                    {user.role}
                                </span>
                            </td>
                            <td class="py-4 px-4 text-slate-500 text-sm">
                                {formatDate(user.createdAt)}
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex justify-end gap-2">
                                    <button
                                        on:click={() => openEditModal(user)}
                                        class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        on:click={() => handleDelete(user._id)}
                                        class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div
            class="flex justify-between items-center pt-4 border-t border-slate-100"
        >
            <div class="text-sm text-slate-500">
                Showing {(meta.current - 1) * meta.pageSize + 1} to {Math.min(
                    meta.current * meta.pageSize,
                    meta.total,
                )} of {meta.total} results
            </div>
            <div class="flex gap-2">
                <button
                    disabled={meta.current === 1}
                    on:click={() => handlePageChange(meta.current - 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                >
                    <ChevronLeft size={20} />
                </button>
                {#each Array(meta.pages) as _, i}
                    <button
                        on:click={() => handlePageChange(i + 1)}
                        class="w-10 h-10 rounded-lg font-medium transition-colors {meta.current ===
                        i + 1
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:bg-slate-50'}"
                    >
                        {i + 1}
                    </button>
                {/each}
                <button
                    disabled={meta.current === meta.pages}
                    on:click={() => handlePageChange(meta.current + 1)}
                    class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    {/if}

    {#if isModalOpen}
        <UserModal
            isOpen={true}
            userData={selectedUser}
            isLoading={isSubmitting}
            on:close={() => (isModalOpen = false)}
            on:submit={handleSubmit}
        />
    {/if}
</div>

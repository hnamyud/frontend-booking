<script>
    import { X, Upload, Image as ImageIcon } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    import { auth } from "../../stores/auth";

    export let isOpen = false;
    /** @type {any} */
    export let destination = null; // If null, it's create mode
    export let isLoading = false;

    const dispatch = createEventDispatcher();

    let name = "";
    let country = "";
    let description = "";
    let error = "";
    /** @type {Array<{file: File|null, url: string, public_id: string|null, isExisting: boolean}>} */
    let items = [];
    /** @type {string[]} */
    let deletedPublicIds = [];

    $: if (isOpen) {
        if (destination) {
            name = destination.name;
            country = destination.country;
            description = destination.description;
            items =
                destination.images?.map(
                    (/** @type {{ url: any; public_id: any; }} */ img) => ({
                        file: null,
                        url: img.url,
                        public_id: img.public_id,
                        isExisting: true,
                    }),
                ) || [];
        } else {
            resetForm();
        }
    }

    function resetForm() {
        name = "";
        country = "";
        description = "";
        items = [];
        deletedPublicIds = [];
        error = "";
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (items.length + files.length > 2) {
            error = "Maximum 2 images allowed";
            return;
        }
        error = "";

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target && typeof ev.target.result === "string") {
                    items = [
                        ...items,
                        {
                            file: file,
                            url: ev.target.result,
                            public_id: null,
                            isExisting: false,
                        },
                    ];
                }
            };
            reader.readAsDataURL(file);
        });
    }

    function handleRemoveItem(index) {
        const itemToRemove = items[index];
        if (itemToRemove.isExisting && itemToRemove.public_id) {
            deletedPublicIds = [...deletedPublicIds, itemToRemove.public_id];
        }
        items = items.filter((_, i) => i !== index);
    }

    import { api } from "../../api.svelte";

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append("images", file);

        const data = await api.request("/api/v1/upload", "POST", formData, {
            Authorization: `Bearer ${$auth.token}`,
        });

        // API returns { data: [{ url, public_id }] }
        return data.data[0];
    }

    async function deleteImage(publicId) {
        try {
            await api.request(
                `/api/v1/upload/${publicId}`,
                "DELETE",
                undefined,
                { Authorization: `Bearer ${$auth.token}` },
            );
        } catch (err) {
            console.error("Error deleting image:", err);
            console.warn(`Failed to delete image ${publicId}`);
        }
    }

    async function handleSubmit() {
        if (!name || !country || !description) {
            error = "Please fill all required fields";
            return;
        }

        isLoading = true;
        error = "";

        try {
            // 1. Delete removed images
            if (deletedPublicIds.length > 0) {
                await Promise.all(
                    deletedPublicIds.map((id) => deleteImage(id)),
                );
            }

            // 2. Upload new images
            const newItems = items.filter((i) => !i.isExisting);
            const existingItems = items.filter((i) => i.isExisting);

            const uploadPromises = newItems.map((item) =>
                uploadImage(item.file),
            );
            const uploadedImages = await Promise.all(uploadPromises);

            // 3. Construct final images array
            // Combine existing images (with their public_ids) and new uploaded images
            const finalImages = [
                ...existingItems.map((i) => ({
                    url: i.url,
                    public_id: i.public_id,
                })),
                ...uploadedImages.map((img) => ({
                    url: img.url,
                    public_id: img.public_id,
                })),
            ];

            // 4. Prepare JSON payload
            const payload = {
                name,
                country,
                description,
                images: finalImages,
            };

            dispatch("submit", payload);
        } catch (err) {
            console.error(err);
            error = "Failed to process images or request";
            isLoading = false;
        }
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
                    {destination ? "Edit Destination" : "Add New Destination"}
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
                    <div class="space-y-2">
                        <label
                            for="name"
                            class="text-sm font-medium text-slate-700"
                            >Name</label
                        >
                        <input
                            id="name"
                            type="text"
                            bind:value={name}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="e.g. Maldives"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            for="country"
                            class="text-sm font-medium text-slate-700"
                            >Country</label
                        >
                        <input
                            id="country"
                            type="text"
                            bind:value={country}
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            placeholder="e.g. Maldives"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label
                        for="description"
                        class="text-sm font-medium text-slate-700"
                        >Description</label
                    >
                    <textarea
                        id="description"
                        bind:value={description}
                        rows="4"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                        placeholder="Enter destination description..."
                    ></textarea>
                </div>

                <div class="space-y-2">
                    <span class="text-sm font-medium text-slate-700"
                        >Images (Max 2)</span
                    >
                    <div class="grid grid-cols-2 gap-4">
                        {#each items as item, i}
                            <div
                                class="relative aspect-video rounded-xl overflow-hidden group border border-slate-200"
                            >
                                <img
                                    src={item.url}
                                    alt="Preview"
                                    class="w-full h-full object-cover"
                                />
                                <button
                                    on:click={() => handleRemoveItem(i)}
                                    class="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        {/each}

                        {#if items.length < 2}
                            <label
                                class="aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-600"
                            >
                                <Upload size={24} />
                                <span class="text-sm font-medium"
                                    >Upload Image</span
                                >
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    on:change={handleFileSelect}
                                    multiple
                                />
                            </label>
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
                        <span
                            >{destination ? "Update" : "Create"} Destination</span
                        >
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

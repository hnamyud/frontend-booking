<script>
    import { api } from "../../api.svelte";
    import { Star, X, Loader2 } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";
    import { fade, scale } from "svelte/transition";

    export let isOpen = false;
    export let bookingId;
    export let tourId;
    export let tourName;

    const dispatch = createEventDispatcher();

    let rating = 5;
    let comment = "";
    let isLoading = false;
    let error = "";

    async function handleSubmit() {
        if (!comment.trim()) {
            error = "Vui lòng nhập nội dung đánh giá";
            return;
        }

        isLoading = true;
        error = "";

        try {
            await api.createReview({
                tour_id: tourId,
                rating,
                comment,
            });
            dispatch("submit");
            handleClose();
        } catch (err) {
            console.error(err);
            error = err.message || "Có lỗi xảy ra khi gửi đánh giá";
        } finally {
            isLoading = false;
        }
    }

    function handleClose() {
        isOpen = false;
        rating = 5;
        comment = "";
        error = "";
        dispatch("close");
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
    >
        <div
            class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <!-- Header -->
            <div
                class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"
            >
                <h3 class="text-lg font-bold text-slate-800">
                    Đánh giá chuyến đi
                </h3>
                <button
                    on:click={handleClose}
                    class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div class="p-6">
                <p class="text-slate-600 mb-6">
                    Bạn cảm thấy thế nào về chuyến đi <span
                        class="font-bold text-slate-900">{tourName}</span
                    >?
                </p>

                <!-- Rating Stars -->
                <div class="flex justify-center gap-2 mb-8">
                    {#each Array(5) as _, i}
                        <button
                            class="p-1 transition-transform hover:scale-110 focus:outline-none"
                            on:click={() => (rating = i + 1)}
                            type="button"
                        >
                            <Star
                                size={32}
                                class={i < rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300"}
                            />
                        </button>
                    {/each}
                </div>

                <div class="text-center font-medium text-slate-700 mb-6">
                    {#if rating === 5}Tuyệt vời! 😍
                    {:else if rating === 4}Rất tốt 😊
                    {:else if rating === 3}Bình thường 😐
                    {:else if rating === 2}Tệ 😞
                    {:else}Rất tệ 😫
                    {/if}
                </div>

                <!-- Comment -->
                <div class="space-y-2">
                    <label
                        for="comment"
                        class="block text-sm font-medium text-slate-700"
                    >
                        Nhận xét của bạn
                    </label>
                    <textarea
                        id="comment"
                        bind:value={comment}
                        rows="4"
                        placeholder="Chia sẻ trải nghiệm của bạn về hướng dẫn viên, địa điểm ăn uống, khách sạn..."
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                    ></textarea>
                </div>

                {#if error}
                    <div
                        class="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                    >
                        {error}
                    </div>
                {/if}

                <!-- Actions -->
                <div class="mt-8 flex gap-3">
                    <button
                        on:click={handleClose}
                        class="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        on:click={handleSubmit}
                        disabled={isLoading}
                        class="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {#if isLoading}
                            <Loader2 size={20} class="animate-spin" />
                            Đang gửi...
                        {:else}
                            Gửi đánh giá
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

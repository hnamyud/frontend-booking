<script>
    import { onMount } from "svelte";
    import ReviewModal from "../components/user/ReviewModal.svelte";
    import { auth } from "../stores/auth";
    import {
        User,
        Mail,
        MapPin,
        Calendar,
        Shield,
        Loader2,
        Edit2,
        Save,
        X,
        Lock,
        ArrowLeft,
        Clock,
        CreditCard,
        ChevronLeft,
        ChevronRight,
        Ticket,
        History,
        Star,
        MessageSquare,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";

    let isLoading = true;
    let userData = null;
    let error = "";
    let isEditing = false;
    let showPasswordModal = false;
    let successMessage = "";

    // Edit form data
    let editForm = {
        name: "",
        email: "",
        birthDay: "",
        gender: "",
        address: "",
    };

    // Password form data
    let passwordForm = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    };

    function getInitials(name) {
        return name ? name.charAt(0).toUpperCase() : "U";
    }

    function formatDate(isoString) {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function formatDateForInput(isoString) {
        if (!isoString) return "";
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function formatDateForAPI(dateString) {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${year}/${month}/${day}`;
    }

    function translateGender(gender) {
        if (gender === "MALE") return "Nam";
        if (gender === "FEMALE") return "Nữ";
        return "Khác";
    }

    import { api } from "../api.svelte";

    async function fetchUserProfile() {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                auth.logout();
                return;
            }

            const data = await api.request(
                "/api/v1/auth/account",
                "GET",
                undefined,
                { Authorization: `Bearer ${token}` },
            );

            userData = data.data;

            // Update edit form with current data
            editForm = {
                name: userData.name || "",
                email: userData.email || "",
                birthDay: formatDateForInput(userData.birthDay) || "",
                gender: userData.gender || "",
                address: userData.address || "",
            };
        } catch (err) {
            console.error(err);
            if (err.message.includes("401")) {
                auth.logout();
                return;
            }
            error = "Không thể tải thông tin người dùng.";
        }
    }

    async function handleUpdateInfo() {
        if (!userData?._id) return;

        isLoading = true;
        error = "";
        successMessage = "";

        try {
            const token = localStorage.getItem("accessToken");
            const payload = {
                name: editForm.name,
                email: editForm.email,
                birthDay: formatDateForAPI(editForm.birthDay),
                gender: editForm.gender,
                address: editForm.address,
            };

            await api.request(
                `/api/v1/user/${userData._id}`,
                "PATCH",
                payload,
                { Authorization: `Bearer ${token}` },
            );

            successMessage = "Cập nhật thành công!";
            isEditing = false;

            // CRITICAL: Reload profile data from server
            await fetchUserProfile();

            // Clear success message after 3 seconds
            setTimeout(() => {
                successMessage = "";
            }, 3000);
        } catch (err) {
            console.error(err);
            if (err.message.includes("401")) {
                auth.logout();
                return;
            }
            error = err.message || "Có lỗi xảy ra khi cập nhật thông tin.";
            alert(error);
        } finally {
            isLoading = false;
        }
    }

    async function handleChangePassword() {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        isLoading = true;
        error = "";

        try {
            const token = localStorage.getItem("accessToken");

            await api.request(
                "/api/v1/user/change-password",
                "PATCH",
                {
                    oldPassword: passwordForm.oldPassword,
                    newPassword: passwordForm.newPassword,
                    confirmPassword: passwordForm.confirmPassword,
                },
                { Authorization: `Bearer ${token}` },
            );

            alert("Đổi mật khẩu thành công!");
            showPasswordModal = false;

            // Clear password form
            passwordForm = {
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            };
        } catch (err) {
            console.error(err);
            if (err.message.includes("401")) {
                auth.logout();
                return;
            }
            error = err.message || "Có lỗi xảy ra khi đổi mật khẩu.";
            alert(error);
        } finally {
            isLoading = false;
        }
    }

    function startEditing() {
        isEditing = true;
    }

    function cancelEditing() {
        isEditing = false;
        // Reset form to current data
        editForm = {
            name: userData.name || "",
            email: userData.email || "",
            birthDay: formatDateForInput(userData.birthDay) || "",
            gender: userData.gender || "",
            address: userData.address || "",
        };
    }

    // Bookings & Payments State
    let bookings = [];
    let bookingsMeta = { current: 1, pageSize: 5, total: 0, pages: 1 };
    let isBookingsLoading = false;

    let payments = [];
    let paymentsMeta = { current: 1, pageSize: 5, total: 0, pages: 1 };
    let isPaymentsLoading = false;

    // Review State
    let showReviewModal = false;
    let selectedBookingForReview = null;
    let reviews = [];
    let reviewsMeta = { current: 1, pageSize: 5, total: 0, pages: 1 };
    let isReviewsLoading = false;

    function handleOpenReview(booking) {
        selectedBookingForReview = booking;
        showReviewModal = true;
    }

    function handleReviewSubmit() {
        // Refresh reviews and show success
        fetchUserReviews();
        successMessage = "Gửi đánh giá thành công!";
        setTimeout(() => (successMessage = ""), 3000);
    }

    // Fetch Bookings
    async function fetchUserBookings(page = 1) {
        if (isBookingsLoading) return;
        isBookingsLoading = true;
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            // Manually constructing URL to use the specific user endpoint if needed,
            // but api.getUserBookings handles it.
            const response = await api.getUserBookings({
                current: page,
                pageSize: 5,
            });

            if (response?.data) {
                bookings = response.data.result;
                bookingsMeta = response.data.meta;
            }
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            isBookingsLoading = false;
        }
    }

    // Fetch Payments
    async function fetchUserPayments(page = 1) {
        if (isPaymentsLoading) return;
        isPaymentsLoading = true;
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const response = await api.getUserPayments({
                current: page,
                pageSize: 5,
            });

            if (response?.data) {
                payments = response.data.result;
                paymentsMeta = response.data.meta;
            }
        } catch (err) {
            console.error("Failed to fetch payments:", err);
        } finally {
            isPaymentsLoading = false;
        }
    }

    // Fetch Reviews
    async function fetchUserReviews(page = 1) {
        if (isReviewsLoading) return;
        isReviewsLoading = true;
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const response = await api.getUserReviews({
                current: page,
                pageSize: 5,
            });

            if (response?.data) {
                reviews = response.data.result;
                reviewsMeta = response.data.meta;
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            isReviewsLoading = false;
        }
    }

    // Helper for currency format
    function formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    }

    // Helper for status translation
    function translateStatus(status) {
        const map = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            CANCELLED: "Đã hủy",
            EXPIRED: "Hết hạn",
            FAILED: "Thất bại",
            COMPLETED: "Hoàn thành",
            SUCCESS: "Thành công",
        };
        return map[status] || status;
    }

    function getStatusColor(status) {
        const map = {
            PENDING: "bg-yellow-100 text-yellow-700",
            CONFIRMED: "bg-green-100 text-green-700",
            SUCCESS: "bg-green-100 text-green-700",
            CANCELLED: "bg-red-100 text-red-700",
            EXPIRED: "bg-gray-100 text-gray-700",
            FAILED: "bg-red-100 text-red-700",
            COMPLETED: "bg-blue-100 text-blue-700",
        };
        return map[status] || "bg-gray-100 text-gray-700";
    }

    onMount(async () => {
        if (!$auth.isAuthenticated) {
            window.location.href = "/login";
            return;
        }

        await fetchUserProfile();
        // Load additional data
        fetchUserBookings();
        fetchUserPayments();
        fetchUserReviews();

        isLoading = false;
    });
</script>

<div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <a
            href="/"
            on:click|preventDefault={() => (window.location.href = "/")}
            class="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium mb-6 transition-colors group"
        >
            <ArrowLeft
                size={20}
                class="group-hover:-translate-x-1 transition-transform"
            />
            <span>Quay lại trang chủ</span>
        </a>

        {#if isLoading}
            <div class="flex justify-center items-center h-64">
                <Loader2 class="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        {:else if error && !userData}
            <div
                class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                role="alert"
            >
                <strong class="font-bold">Lỗi!</strong>
                <span class="block sm:inline">{error}</span>
            </div>
        {:else if userData}
            <!-- Success Toast -->
            {#if successMessage}
                <div
                    transition:fade
                    class="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
                >
                    {successMessage}
                </div>
            {/if}

            <div
                in:fade={{ duration: 300 }}
                class="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
                <!-- Cover Image -->
                <div
                    class="h-48 bg-gradient-to-r from-emerald-500 to-sky-500 relative"
                >
                    <div class="absolute -bottom-16 left-8">
                        <div
                            class="w-32 h-32 rounded-full bg-white p-2 shadow-lg"
                        >
                            <div
                                class="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-4xl font-bold"
                            >
                                {getInitials(userData.name)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-20 px-8 pb-8">
                    <!-- Header Info -->
                    <div
                        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
                    >
                        <div>
                            <h1 class="text-3xl font-bold text-slate-900">
                                {userData.name}
                            </h1>
                            <div
                                class="flex items-center gap-2 text-slate-500 mt-1"
                            >
                                <Mail size={16} />
                                <span>{userData.email}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span
                                class={`px-4 py-1.5 rounded-full text-sm font-bold ${userData.role === "ADMIN" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                            >
                                {userData.role}
                            </span>
                        </div>
                    </div>

                    <hr class="border-slate-100 mb-8" />

                    {#if isEditing}
                        <!-- Edit Mode -->
                        <h2 class="text-xl font-bold text-slate-800 mb-6">
                            Chỉnh sửa thông tin
                        </h2>
                        <form
                            on:submit|preventDefault={handleUpdateInfo}
                            class="space-y-6"
                        >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Name -->
                                <div>
                                    <label
                                        for="name"
                                        class="block text-sm font-medium text-slate-700 mb-2"
                                        >Họ tên</label
                                    >
                                    <input
                                        type="text"
                                        id="name"
                                        bind:value={editForm.name}
                                        required
                                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    />
                                </div>

                                <!-- Email -->
                                <div>
                                    <label
                                        for="email"
                                        class="block text-sm font-medium text-slate-700 mb-2"
                                        >Email</label
                                    >
                                    <input
                                        type="email"
                                        id="email"
                                        bind:value={editForm.email}
                                        required
                                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    />
                                </div>

                                <!-- Birth Day -->
                                <div>
                                    <label
                                        for="birthDay"
                                        class="block text-sm font-medium text-slate-700 mb-2"
                                        >Ngày sinh</label
                                    >
                                    <input
                                        type="date"
                                        id="birthDay"
                                        bind:value={editForm.birthDay}
                                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    />
                                </div>

                                <!-- Gender -->
                                <div>
                                    <label
                                        for="gender"
                                        class="block text-sm font-medium text-slate-700 mb-2"
                                        >Giới tính</label
                                    >
                                    <select
                                        id="gender"
                                        bind:value={editForm.gender}
                                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    >
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>

                                <!-- Address -->
                                <div class="md:col-span-2">
                                    <label
                                        for="address"
                                        class="block text-sm font-medium text-slate-700 mb-2"
                                        >Địa chỉ</label
                                    >
                                    <input
                                        type="text"
                                        id="address"
                                        bind:value={editForm.address}
                                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    on:click={cancelEditing}
                                    class="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
                                >
                                    <X size={18} />
                                    <span>Hủy</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    class="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    <span
                                        >{isLoading
                                            ? "Đang lưu..."
                                            : "Lưu thay đổi"}</span
                                    >
                                </button>
                            </div>
                        </form>

                        <hr class="border-slate-100 my-8" />

                        <!-- Change Password Button -->
                        <button
                            on:click={() => (showPasswordModal = true)}
                            class="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <Lock size={18} />
                            <span>Đổi mật khẩu</span>
                        </button>
                    {:else}
                        <!-- View Mode -->
                        <h2 class="text-xl font-bold text-slate-800 mb-6">
                            Thông tin cá nhân
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Gender -->
                            <div
                                class="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div
                                    class="p-2 bg-white rounded-lg shadow-sm text-emerald-600"
                                >
                                    <User size={24} />
                                </div>
                                <div>
                                    <p
                                        class="text-sm text-slate-500 font-medium"
                                    >
                                        Giới tính
                                    </p>
                                    <p
                                        class="text-slate-900 font-semibold mt-0.5"
                                    >
                                        {translateGender(userData.gender)}
                                    </p>
                                </div>
                            </div>

                            <!-- Birthday -->
                            <div
                                class="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div
                                    class="p-2 bg-white rounded-lg shadow-sm text-emerald-600"
                                >
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p
                                        class="text-sm text-slate-500 font-medium"
                                    >
                                        Ngày sinh
                                    </p>
                                    <p
                                        class="text-slate-900 font-semibold mt-0.5"
                                    >
                                        {formatDate(userData.birthDay)}
                                    </p>
                                </div>
                            </div>

                            <!-- Address -->
                            <div
                                class="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div
                                    class="p-2 bg-white rounded-lg shadow-sm text-emerald-600"
                                >
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p
                                        class="text-sm text-slate-500 font-medium"
                                    >
                                        Địa chỉ
                                    </p>
                                    <p
                                        class="text-slate-900 font-semibold mt-0.5"
                                    >
                                        {userData.address || "Chưa cập nhật"}
                                    </p>
                                </div>
                            </div>

                            <!-- Joined At -->
                            <div
                                class="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div
                                    class="p-2 bg-white rounded-lg shadow-sm text-emerald-600"
                                >
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <p
                                        class="text-sm text-slate-500 font-medium"
                                    >
                                        Ngày tham gia
                                    </p>
                                    <p
                                        class="text-slate-900 font-semibold mt-0.5"
                                    >
                                        {formatDate(userData.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <hr class="border-slate-100 my-8" />

                        <!-- Action Buttons in View Mode -->
                        <div class="flex gap-3">
                            <button
                                on:click={startEditing}
                                class="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                            >
                                <Edit2 size={18} />
                                <span>Chỉnh sửa</span>
                            </button>
                            <button
                                on:click={() => (showPasswordModal = true)}
                                class="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                <Lock size={18} />
                                <span>Đổi mật khẩu</span>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Booking History Section -->
            <div
                class="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden p-8"
            >
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Ticket size={24} />
                    </div>
                    <h2 class="text-xl font-bold text-slate-800">
                        Lịch sử đặt tour
                    </h2>
                </div>

                {#if isBookingsLoading && bookings.length === 0}
                    <div class="flex justify-center p-8">
                        <Loader2
                            class="w-8 h-8 text-emerald-600 animate-spin"
                        />
                    </div>
                {:else if bookings.length > 0}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="text-slate-500 text-sm border-b border-slate-100"
                                >
                                    <th class="py-4 font-medium"
                                        >Mã Tour / Ngày đi</th
                                    >
                                    <th class="py-4 font-medium">Khách</th>
                                    <th class="py-4 font-medium">Tổng tiền</th>
                                    <th class="py-4 font-medium">Trạng thái</th>
                                    <th class="py-4 font-medium">Ngày đặt</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                {#each bookings as booking}
                                    <tr
                                        class="hover:bg-slate-50 transition-colors text-sm"
                                    >
                                        <td class="py-4 pr-4">
                                            {#if booking.ticketCode}
                                                <div
                                                    class="font-medium text-slate-900"
                                                >
                                                    {booking.ticketCode}
                                                </div>
                                                {#if booking.startDate}
                                                    <div
                                                        class="text-xs text-slate-500 mt-1"
                                                    >
                                                        Khởi hành: {formatDate(
                                                            booking.startDate,
                                                        )}
                                                    </div>
                                                {/if}
                                            {:else}
                                                <span
                                                    class="text-slate-400 italic"
                                                    >Không khả dụng</span
                                                >
                                            {/if}
                                        </td>

                                        <td class="py-4 text-slate-600">
                                            {booking.numberOfGuests} người
                                        </td>
                                        <td
                                            class="py-4 font-medium text-emerald-600"
                                        >
                                            {formatCurrency(booking.totalPrice)}
                                        </td>
                                        <td class="py-4">
                                            <span
                                                class={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}
                                            >
                                                {translateStatus(
                                                    booking.status,
                                                )}
                                            </span>
                                            {#if booking.status === "COMPLETED"}
                                                <button
                                                    on:click={() =>
                                                        handleOpenReview(
                                                            booking,
                                                        )}
                                                    class="ml-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                                                >
                                                    Đánh giá
                                                </button>
                                            {/if}
                                        </td>
                                        <td class="py-4 text-slate-500">
                                            {formatDate(booking.createdAt)}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <!-- Pagination -->
                    {#if bookingsMeta.pages > 1}
                        <div
                            class="flex justify-center items-center gap-4 mt-6"
                        >
                            <button
                                disabled={bookingsMeta.current === 1}
                                on:click={() =>
                                    fetchUserBookings(bookingsMeta.current - 1)}
                                class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronLeft size={20} class="text-slate-600" />
                            </button>
                            <span class="text-sm font-medium text-slate-600">
                                Trang {bookingsMeta.current} / {bookingsMeta.pages}
                            </span>
                            <button
                                disabled={bookingsMeta.current ===
                                    bookingsMeta.pages}
                                on:click={() =>
                                    fetchUserBookings(bookingsMeta.current + 1)}
                                class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronRight
                                    size={20}
                                    class="text-slate-600"
                                />
                            </button>
                        </div>
                    {/if}
                {:else}
                    <div class="text-center py-8 text-slate-500 italic">
                        Bạn chưa có lịch sử đặt tour nào.
                    </div>
                {/if}
            </div>

            <!-- Review History Section -->
            <div
                class="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden p-8"
            >
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                        <MessageSquare size={24} />
                    </div>
                    <h2 class="text-xl font-bold text-slate-800">
                        Lịch sử đánh giá
                    </h2>
                </div>

                {#if isReviewsLoading && reviews.length === 0}
                    <div class="flex justify-center p-8">
                        <Loader2
                            class="w-8 h-8 text-emerald-600 animate-spin"
                        />
                    </div>
                {:else if reviews.length > 0}
                    <div class="space-y-4">
                        {#each reviews as review}
                            <div
                                class="p-4 bg-slate-50 rounded-xl border border-slate-100"
                            >
                                <div
                                    class="flex justify-between items-start mb-2"
                                >
                                    <div>
                                        <h3 class="font-bold text-slate-900">
                                            {review.tour_id?.name ||
                                                "Unknown Tour"}
                                        </h3>
                                        <div
                                            class="text-xs text-slate-500 mt-1"
                                        >
                                            {formatDate(review.createdAt)} • {review
                                                .tour_id?.duration || ""}
                                        </div>
                                    </div>
                                    <div
                                        class="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200"
                                    >
                                        <Star
                                            size={14}
                                            class="fill-yellow-400 text-yellow-400"
                                        />
                                        <span
                                            class="font-bold text-sm text-slate-700"
                                            >{review.rating}</span
                                        >
                                    </div>
                                </div>
                                {#if review.comment}
                                    <p
                                        class="text-slate-600 text-sm mt-3 bg-white p-3 rounded-lg border border-slate-100 italic"
                                    >
                                        "{review.comment}"
                                    </p>
                                {/if}
                            </div>
                        {/each}
                    </div>

                    <!-- Pagination -->
                    {#if reviewsMeta.pages > 1}
                        <div
                            class="flex justify-center items-center gap-4 mt-6"
                        >
                            <button
                                disabled={reviewsMeta.current === 1}
                                on:click={() =>
                                    fetchUserReviews(reviewsMeta.current - 1)}
                                class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronLeft size={20} class="text-slate-600" />
                            </button>
                            <span class="text-sm font-medium text-slate-600">
                                Trang {reviewsMeta.current} / {reviewsMeta.pages}
                            </span>
                            <button
                                disabled={reviewsMeta.current ===
                                    reviewsMeta.pages}
                                on:click={() =>
                                    fetchUserReviews(reviewsMeta.current + 1)}
                                class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronRight
                                    size={20}
                                    class="text-slate-600"
                                />
                            </button>
                        </div>
                    {/if}
                {:else}
                    <div class="text-center py-8 text-slate-500 italic">
                        Bạn chưa có đánh giá nào.
                    </div>
                {/if}
            </div>

            <!-- Modals -->
            <ReviewModal
                isOpen={showReviewModal}
                bookingId={selectedBookingForReview?._id}
                tourId={selectedBookingForReview?.tour_id}
                tourName={selectedBookingForReview?.tour_name}
                on:close={() => (showReviewModal = false)}
                on:submit={handleReviewSubmit}
            />

            <!-- Payment History Section -->
            <div
                class="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden p-8"
            >
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <History size={24} />
                    </div>
                    <h2 class="text-xl font-bold text-slate-800">
                        Lịch sử thanh toán
                    </h2>
                </div>

                {#if isPaymentsLoading && payments.length === 0}
                    <div class="flex justify-center p-8">
                        <Loader2
                            class="w-8 h-8 text-emerald-600 animate-spin"
                        />
                    </div>
                {:else if payments.length > 0}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="text-slate-500 text-sm border-b border-slate-100"
                                >
                                    <th class="py-4 font-medium"
                                        >Mã Giao Dịch</th
                                    >
                                    <th class="py-4 font-medium"
                                        >Cổng thanh toán</th
                                    >
                                    <th class="py-4 font-medium">Số tiền</th>
                                    <th class="py-4 font-medium">Trạng thái</th>
                                    <th class="py-4 font-medium"
                                        >Ngày thanh toán</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                {#each payments as payment}
                                    <tr
                                        class="hover:bg-slate-50 transition-colors text-sm"
                                    >
                                        <td
                                            class="py-4 pr-4 font-medium text-slate-900"
                                        >
                                            {payment.code}
                                        </td>
                                        <td class="py-4 text-slate-600">
                                            {payment.provider}
                                        </td>
                                        <td
                                            class="py-4 font-medium text-emerald-600"
                                        >
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td class="py-4">
                                            <span
                                                class={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}
                                            >
                                                {translateStatus(
                                                    payment.status,
                                                )}
                                            </span>
                                        </td>
                                        <td class="py-4 text-slate-500">
                                            {formatDate(payment.createdAt)}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <!-- Pagination -->
                    {#if paymentsMeta.pages > 1}
                        <div
                            class="flex justify-center items-center gap-4 mt-6"
                        >
                            <button
                                disabled={paymentsMeta.current === 1}
                                on:click={() =>
                                    fetchUserPayments(paymentsMeta.current - 1)}
                                class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronLeft size={20} class="text-slate-600" />
                            </button>
                            <span class="text-sm font-medium text-slate-600">
                                Trang {paymentsMeta.current} / {paymentsMeta.pages}
                            </span>
                            <button
                                disabled={paymentsMeta.current ===
                                    paymentsMeta.pages}
                                on:click={() =>
                                    fetchUserPayments(paymentsMeta.current + 1)}
                                class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronRight
                                    size={20}
                                    class="text-slate-600"
                                />
                            </button>
                        </div>
                    {/if}
                {:else}
                    <div class="text-center py-8 text-slate-500 italic">
                        Bạn chưa có lịch sử thanh toán nào.
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<!-- Password Change Modal -->
{#if showPasswordModal}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        on:click={() => (showPasswordModal = false)}
        on:keydown={(e) => e.key === "Escape" && (showPasswordModal = false)}
        role="button"
        tabindex="0"
        aria-label="Close modal"
    >
        <div
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            on:click|stopPropagation
            on:keydown|stopPropagation
            role="document"
        >
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-slate-900">Đổi mật khẩu</h3>
                <button
                    on:click={() => (showPasswordModal = false)}
                    class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form
                on:submit|preventDefault={handleChangePassword}
                class="space-y-4"
            >
                <!-- Old Password -->
                <div>
                    <label
                        for="oldPassword"
                        class="block text-sm font-medium text-slate-700 mb-2"
                        >Mật khẩu cũ</label
                    >
                    <input
                        type="password"
                        id="oldPassword"
                        bind:value={passwordForm.oldPassword}
                        required
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                </div>

                <!-- New Password -->
                <div>
                    <label
                        for="newPassword"
                        class="block text-sm font-medium text-slate-700 mb-2"
                        >Mật khẩu mới</label
                    >
                    <input
                        type="password"
                        id="newPassword"
                        bind:value={passwordForm.newPassword}
                        required
                        minlength="6"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                </div>

                <!-- Confirm Password -->
                <div>
                    <label
                        for="confirmPassword"
                        class="block text-sm font-medium text-slate-700 mb-2"
                        >Xác nhận mật khẩu mới</label
                    >
                    <input
                        type="password"
                        id="confirmPassword"
                        bind:value={passwordForm.confirmPassword}
                        required
                        minlength="6"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    disabled={isLoading}
                    class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
            </form>
        </div>
    </div>
{/if}

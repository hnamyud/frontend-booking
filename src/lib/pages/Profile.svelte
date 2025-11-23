<script>
    import { onMount } from "svelte";
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

    async function fetchUserProfile() {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/account",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (response.status === 401) {
                auth.logout();
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.json();
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

            const response = await fetch(
                `http://localhost:8080/api/v1/user/${userData._id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (response.status === 401) {
                auth.logout();
                return;
            }

            const data = await response.json();

            if (response.ok) {
                successMessage = "Cập nhật thành công!";
                isEditing = false;

                // CRITICAL: Reload profile data from server
                await fetchUserProfile();

                // Clear success message after 3 seconds
                setTimeout(() => {
                    successMessage = "";
                }, 3000);
            } else {
                error = data.message || "Cập nhật thất bại";
                alert(error);
            }
        } catch (err) {
            console.error(err);
            error = "Có lỗi xảy ra khi cập nhật thông tin.";
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
            const response = await fetch(
                "http://localhost:8080/api/v1/user/change-password",
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        oldPassword: passwordForm.oldPassword,
                        newPassword: passwordForm.newPassword,
                        confirmPassword: passwordForm.confirmPassword,
                    }),
                },
            );

            if (response.status === 401) {
                auth.logout();
                return;
            }

            const data = await response.json();

            if (response.ok) {
                alert("Đổi mật khẩu thành công!");
                showPasswordModal = false;

                // Clear password form
                passwordForm = {
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                };
            } else {
                error = data.message || "Đổi mật khẩu thất bại";
                alert(error);
            }
        } catch (err) {
            console.error(err);
            error = "Có lỗi xảy ra khi đổi mật khẩu.";
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

    onMount(async () => {
        if (!$auth.isAuthenticated) {
            window.location.href = "/login";
            return;
        }

        await fetchUserProfile();
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
        {/if}
    </div>
</div>

<!-- Password Change Modal -->
{#if showPasswordModal}
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        on:click={() => (showPasswordModal = false)}
    >
        <div
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            on:click|stopPropagation
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

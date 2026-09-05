<template>
  <div class="users-page">
    <div class="users-container">
      <div class="page-header">
        <div class="header-copy">
          <span class="eyebrow">ADMIN PANEL</span>
          <h1>User Management</h1>
          <p>View registered users, manage account roles and remove users from the platform.</p>
        </div>

        <div class="header-stats">
          <div class="stat-box">
            <div class="stat-icon">
              <i class="mdi mdi-account-group-outline"></i>
            </div>
            <div>
              <span>Total users</span>
              <strong>{{ users.length }}</strong>
            </div>
          </div>

          <div class="stat-box">
            <div class="stat-icon">
              <i class="mdi mdi-shield-account-outline"></i>
            </div>
            <div>
              <span>Organizers</span>
              <strong>{{ users.filter(user => user.role === "organizer").length }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <i class="mdi mdi-magnify"></i>
          <input v-model="search" type="text" placeholder="Search by username or email..." />
        </div>

        <div class="filter-wrap">
          <i class="mdi mdi-filter-variant"></i>
          <select v-model="roleFilter" class="role-filter">
            <option value="">All roles</option>
            <option value="player">Players</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="state-card">
        <div class="state-icon">
          <i class="mdi mdi-loading mdi-spin"></i>
        </div>
        <div>
          <strong>Loading users</strong>
          <span>Please wait while user data is being loaded.</span>
        </div>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="state-card">
        <div class="state-icon">
          <i class="mdi mdi-account-search-outline"></i>
        </div>
        <div>
          <strong>No users found</strong>
          <span>Try changing your search or selected role.</span>
        </div>
      </div>

      <div v-else class="users-card">
        <div class="table-top">
          <div>
            <span class="section-label">USERS</span>
            <h2>Registered accounts</h2>
          </div>

          <span class="results-count">{{ filteredUsers.length }} results</span>
        </div>

        <div class="table-header">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Actions</span>
        </div>

        <div v-for="user in filteredUsers" :key="user._id" class="user-row" :class="{ current: isCurrentUser(user) }">
          <div class="user-info">
            <div class="avatar">{{ initial(user.username) }}</div>

            <div class="user-name">
              <div class="name-row">
                <strong>{{ user.username }}</strong>
                <span v-if="isCurrentUser(user)" class="you-badge">YOU</span>
              </div>
              <span class="user-id">{{ user._id }}</span>
            </div>
          </div>

          <div class="email">
            <i class="mdi mdi-email-outline"></i>
            <span>{{ user.email }}</span>
          </div>

          <div class="role-column">
            <select v-model="user.role" class="role-select" :class="user.role" :disabled="isCurrentUser(user)" @change="updateRole(user)">
              <option value="player">Player</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="actions">
            <button class="delete-btn" :disabled="isCurrentUser(user)" @click="deleteUser(user)">
              <i class="mdi mdi-delete-outline"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../services/api";
import { useAuthStore } from "../store/auth";

const auth = useAuthStore();

const users = ref([]);
const loading = ref(true);
const search = ref("");
const roleFilter = ref("");

const loadUsers = async () => {
  try {
    const res = await api.get("/users");
    users.value = res.data;
  } catch (err) {
    console.error("Failed to load users:", err);

    alert(err.response?.data?.message || "Failed to load users");
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const searchValue = search.value.toLowerCase();

    const matchesSearch =
      user.username?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue);

    const matchesRole =
      !roleFilter.value ||
      user.role === roleFilter.value;

    return matchesSearch && matchesRole;
  });
});

const isCurrentUser = user => {
  const currentUserId = auth.user?._id || auth.user?.id;

  return String(user._id) === String(currentUserId);
};

const updateRole = async user => {
  try {
    const res = await api.put(`/users/${user._id}`, {
      role: user.role
    });

    alert(
      res.data.message ||
      "User role updated successfully"
    );
  } catch (err) {
    console.error("Failed to update role:", err);

    alert(
      err.response?.data?.message ||
      "Failed to update user role"
    );

    await loadUsers();
  }
};

const deleteUser = async user => {
  const confirmed = confirm(
    `Are you sure you want to delete ${user.username}?`
  );

  if (!confirmed) return;

  try {
    const res = await api.delete(`/users/${user._id}`);

    users.value = users.value.filter(
      item => item._id !== user._id
    );

    alert(
      res.data.message ||
      "User deleted successfully"
    );
  } catch (err) {
    console.error("Failed to delete user:", err);

    alert(
      err.response?.data?.message ||
      "Failed to delete user"
    );
  }
};

const initial = username => {
  return username?.charAt(0).toUpperCase() || "?";
};

onMounted(loadUsers);
</script>

<style scoped>
.users-page {
  min-height: 100vh;
  padding: 110px 24px 60px;
  background:
    radial-gradient(circle at 12% 8%, rgba(75,222,75,.09), transparent 34%),
    radial-gradient(circle at 90% 22%, rgba(0,140,255,.035), transparent 34%),
    #0b0c10;
  color: white;
}

.users-container {
  max-width: 1120px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 30px;
}

.header-copy {
  max-width: 620px;
}

.eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #4BDE4B;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 48px);
  line-height: 1;
  letter-spacing: -1.2px;
}

.page-header p {
  max-width: 560px;
  margin: 11px 0 0;
  color: rgba(255,255,255,.48);
  font-size: 12px;
  line-height: 1.65;
}

.header-stats {
  display: flex;
  gap: 10px;
}

.stat-box {
  min-width: 145px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  background: rgba(18,20,27,.82);
  box-shadow: 0 12px 30px rgba(0,0,0,.16);
}

.stat-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(75,222,75,.07);
  color: #4BDE4B;
  font-size: 18px;
}

.stat-box > div:last-child {
  display: flex;
  flex-direction: column;
}

.stat-box span {
  color: rgba(255,255,255,.4);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .7px;
}

.stat-box strong {
  margin-top: 2px;
  font-size: 18px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-box,
.filter-wrap {
  position: relative;
}

.search-box {
  flex: 1;
}

.search-box i,
.filter-wrap > i {
  position: absolute;
  left: 13px;
  top: 50%;
  z-index: 1;
  transform: translateY(-50%);
  color: rgba(255,255,255,.26);
  pointer-events: none;
}

.search-box input,
.role-filter {
  height: 44px;
  box-sizing: border-box;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 11px;
  background: rgba(18,20,27,.82);
  color: white;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: .2s ease;
}

.search-box input {
  width: 100%;
  padding: 0 14px 0 40px;
}

.filter-wrap {
  min-width: 175px;
}

.role-filter {
  width: 100%;
  padding: 0 12px 0 39px;
  cursor: pointer;
}

.search-box input:focus,
.role-filter:focus {
  border-color: rgba(75,222,75,.38);
  background: rgba(75,222,75,.025);
  box-shadow: 0 0 0 3px rgba(75,222,75,.035);
}

.role-filter option,
.role-select option {
  background: #12141b;
  color: white;
}

.users-card {
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 18px;
  background: rgba(18,20,27,.9);
  box-shadow: 0 20px 55px rgba(0,0,0,.19);
}

.table-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 17px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.section-label {
  color: #4BDE4B;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.1px;
}

.table-top h2 {
  margin: 4px 0 0;
  font-size: 16px;
}

.results-count {
  padding: 6px 9px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 20px;
  background: rgba(255,255,255,.025);
  color: rgba(255,255,255,.4);
  font-size: 14px;
}

.table-header,
.user-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr .8fr .7fr;
  align-items: center;
  gap: 20px;
}

.table-header {
  padding: 11px 20px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  background: rgba(255,255,255,.014);
  color: rgba(255,255,255,.3);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .9px;
  text-transform: uppercase;
}

.user-row {
  position: relative;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255,255,255,.045);
  transition: .2s ease;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background: rgba(255,255,255,.018);
}

.user-row.current {
  background: rgba(75,222,75,.018);
}

.user-row.current::before {
  content: "";
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 2px;
  background: #4BDE4B;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.avatar {
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(75,222,75,.11);
  border-radius: 11px;
  background: rgba(75,222,75,.06);
  color: #4BDE4B;
  font-size: 16px;
  font-weight: 700;
}

.user-name {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.user-info strong {
  font-size: 14px;
  font-weight: 600;
}

.you-badge {
  padding: 2px 5px;
  border: 1px solid rgba(75,222,75,.14);
  border-radius: 4px;
  background: rgba(75,222,75,.07);
  color: #4BDE4B;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .5px;
}

.user-id {
  overflow: hidden;
  max-width: 180px;
  color: rgba(255,255,255,.2);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: rgba(255,255,255,.56);
  font-size: 10px;
}

.email i {
  color: rgba(255,255,255,.22);
  font-size: 18px;
}

.email span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-select {
  min-width: 116px;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: .2s ease;
}

.role-select.player {
  border-color: rgba(102,178,255,.13);
  color: #8fc7ff;
}

.role-select.organizer {
  border-color: rgba(75,222,75,.15);
  color: #4BDE4B;
}

.role-select.admin {
  border-color: rgba(255,209,102,.14);
  color: #ffd166;
}

.role-select:focus {
  border-color: rgba(75,222,75,.4);
}

.role-select:disabled {
  opacity: .42;
  cursor: not-allowed;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 76px;
  padding: 8px 10px;
  border: 1px solid rgba(255,77,77,.16);
  border-radius: 8px;
  background: rgba(255,77,77,.045);
  color: #ff6b6b;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: .2s ease;
}

.delete-btn:hover:not(:disabled) {
  border-color: rgba(255,77,77,.45);
  background: rgba(255,77,77,.13);
  color: #ff8585;
}

.delete-btn:disabled {
  opacity: .2;
  cursor: not-allowed;
}

.state-card {
  min-height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 18px;
  background: rgba(18,20,27,.9);
  color: rgba(255,255,255,.5);
}

.state-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: rgba(75,222,75,.06);
  color: #4BDE4B;
  font-size: 19px;
}

.state-card > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.state-card strong {
  color: rgba(255,255,255,.75);
  font-size: 11px;
}

.state-card span {
  color: rgba(255,255,255,.35);
  font-size: 9px;
}

@media (max-width: 900px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-stats {
    width: 100%;
  }

  .stat-box {
    flex: 1;
  }
}

@media (max-width: 760px) {
  .users-page {
    padding: 90px 15px 40px;
  }

  .header-stats,
  .toolbar {
    flex-direction: column;
  }

  .filter-wrap {
    width: 100%;
  }

  .table-header {
    display: none;
  }

  .user-row {
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  .email {
    grid-column: 1 / -1;
  }

  .role-column {
    grid-column: 1;
  }

  .actions {
    grid-column: 2;
    grid-row: 3;
  }

  .user-id {
    max-width: 130px;
  }
}
</style>
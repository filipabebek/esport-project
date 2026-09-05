<template>
  <div class="dashboard-page">
    <div class="bg-blur"></div>
    <div class="bg-blur-second"></div>

    <main class="dashboard-container">
      <div v-if="loading" class="dashboard-loading">
        <i class="mdi mdi-loading mdi-spin"></i>
        <span>Loading dashboard...</span>
      </div>

      <div v-else-if="error" class="dashboard-error">{{ error }}</div>

      <template v-else>
        <section class="page-header">
          <div>
            <p class="tag">Organizer Dashboard</p>
            <h1>Welcome back, <span>{{ username }}</span></h1>
            <p class="subtitle">Manage your tournaments, participants and recent activity.</p>
          </div>

          <router-link to="/tournaments/create" class="create-btn">
            <i class="mdi mdi-plus"></i>Create tournament
          </router-link>
        </section>

        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-trophy-outline"></i>
            </div>
            <div>
              <strong>{{ dashboard.organizerStats?.totalTournaments ?? 0 }}</strong>
              <span>Total tournaments</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-broadcast"></i>
            </div>
            <div>
              <strong>{{ dashboard.organizerStats?.activeTournaments ?? 0 }}</strong>
              <span>Active tournaments</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-account-group-outline"></i>
            </div>
            <div>
              <strong>{{ dashboard.organizerStats?.totalParticipants ?? 0 }}</strong>
              <span>Total participants</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-check-circle-outline"></i>
            </div>
            <div>
              <strong>{{ dashboard.organizerStats?.completedTournaments ?? 0 }}</strong>
              <span>Completed</span>
            </div>
          </div>
        </section>

        <section class="overview-grid">
          <div class="dashboard-card next-card">
            <div class="section-header">
              <div>
                <h3>Next tournament</h3>
                <p>Your closest upcoming competition.</p>
              </div>
              <i class="mdi mdi-calendar-clock-outline header-icon"></i>
            </div>

            <template v-if="dashboard.nextTournament">
              <div class="next-content">
                <div class="next-top">
                  <span class="status-badge" :class="statusClass(dashboard.nextTournament.status)">{{ dashboard.nextTournament.status }}</span>

                  <div>
                    <h2>{{ dashboard.nextTournament.name }}</h2>
                    <p>{{ dashboard.nextTournament.game?.name || "Unknown game"}} • {{ dashboard.nextTournament.region }}</p>
                  </div>
                </div>

                <div class="next-meta">
                  <span>
                    <i class="mdi mdi-calendar-outline"></i>{{ formatDate(dashboard.nextTournament.date) }}
                  </span>

                  <span>
                    <i class="mdi mdi-account-group-outline"></i>{{ tournamentPlayers(dashboard.nextTournament) }}/{{ dashboard.nextTournament.maxPlayers ?? 0 }} players
                  </span>

                  <span>
                    <i class="mdi mdi-cash"></i>{{ dashboard.nextTournament.prize || "No prize" }}
                  </span>
                </div>

                <div class="capacity">
                  <div class="capacity-header">
                    <span>Participants</span>
                    <span>{{ capacityPercent(dashboard.nextTournament) }}%</span>
                  </div>

                  <div class="progress">
                    <div class="progress-fill" :style="{ width: capacityPercent(dashboard.nextTournament) + '%' }"></div>
                  </div>
                </div>

                <router-link
                  :to="`/tournaments/${dashboard.nextTournament._id}`"
                  class="manage-btn"
                >
                  Manage tournament
                  <i class="mdi mdi-arrow-right"></i>
                </router-link>
              </div>
            </template>

            <div v-else class="empty-state">
              <i class="mdi mdi-calendar-blank-outline"></i>
              <strong>No upcoming tournaments</strong>
              <p>Create a tournament to start organizing your next competition.</p>
              <router-link to="/tournaments/create">Create tournament</router-link>
            </div>
          </div>

          <div class="dashboard-card status-card">
            <div class="section-header">
              <div>
                <h3>Tournament status</h3>
                <p>Overview of your competitions.</p>
              </div>
              <i class="mdi mdi-chart-donut header-icon"></i>
            </div>

            <div class="status-list">
              <div class="status-row">
                <div>
                  <span class="status-dot upcoming"></span>
                  <span>Upcoming</span>
                </div>
                <strong>{{ dashboard.statusCounts?.upcoming ?? 0 }}</strong>
              </div>

              <div class="status-row">
                <div>
                  <span class="status-dot live"></span>
                  <span>Live</span>
                </div>
                <strong>{{ dashboard.statusCounts?.live ?? 0 }}</strong>
              </div>

              <div class="status-row">
                <div>
                  <span class="status-dot ended"></span>
                  <span>Ended</span>
                </div>
                <strong>{{ dashboard.statusCounts?.ended ?? 0 }}</strong>
              </div>
            </div>

            <div class="status-total">
              <span>Total</span>
              <strong>{{ dashboard.organizerStats?.totalTournaments ?? 0 }}</strong>
            </div>
          </div>
        </section>

        <section class="dashboard-card tournaments-card">
          <div class="section-header">
            <div>
              <h3>Your tournaments</h3>
              <p>Recently created tournaments and their current status.</p>
            </div>

            <router-link to="/my-tournaments">View all<i class="mdi mdi-arrow-right"></i>
            </router-link>
          </div>

          <div v-if="dashboard.tournaments?.length" class="tournament-list">
            <div
              v-for="tournament in dashboard.tournaments"
              :key="tournament._id"
              class="tournament-row"
            >
              <div class="tournament-icon">
                <i class="mdi mdi-trophy-outline"></i>
              </div>

              <div class="tournament-info">
                <strong>{{ tournament.name }}</strong>
                <span>{{ tournament.game }} • {{ tournament.region }}</span>
              </div>

              <div class="tournament-detail tournament-date">
                <span>Date</span>
                <strong>{{ formatDate(tournament.date) }}</strong>
              </div>

              <div class="tournament-detail">
                <span>Players</span>
                <strong>{{ tournamentPlayers(tournament) }}/{{ tournament.maxPlayers ?? 0 }}</strong>
              </div>

              <span class="status-badge" :class="statusClass(tournament.status)">
                {{ tournament.status }}
              </span>

              <router-link :to="`/tournaments/${tournament._id}`" class="row-action">
                <i class="mdi mdi-arrow-right"></i>
              </router-link>
            </div>
          </div>

          <div v-else class="empty-state compact">
            <i class="mdi mdi-trophy-outline"></i>
            <strong>No tournaments yet</strong>
            <p>Your created tournaments will appear here.</p>
            <router-link to="/tournaments/create">Create your first tournament</router-link>
          </div>
        </section>

        <section class="activity-grid">
          <div class="dashboard-card">
            <div class="section-header">
              <div>
                <h3>Recent registrations</h3>
                <p>Latest players joining your tournaments.</p>
              </div>
              <i class="mdi mdi-account-plus-outline header-icon"></i>
            </div>

            <div v-if="dashboard.recentRegistrations?.length" class="activity-list">
              <div
                v-for="registration in dashboard.recentRegistrations"
                :key="registration._id"
                class="activity-row"
              >
                <div class="player-avatar">
                  {{ initial(registration.username) }}
                </div>

                <div class="activity-info">
                  <strong>{{ registration.username }}</strong>
                  <span>{{ registration.tournamentName }}</span>
                </div>

                <span class="activity-date">{{ formatDate(registration.date) }}</span>
              </div>
            </div>

            <div v-else class="empty-state small">
              <i class="mdi mdi-account-plus-outline"></i>
              <p>No recent registrations.</p>
            </div>
          </div>

          <div class="dashboard-card">
            <div class="section-header">
              <div>
                <h3>Recent results</h3>
                <p>Latest completed tournaments.</p>
              </div>
              <i class="mdi mdi-medal-outline header-icon"></i>
            </div>

            <div v-if="dashboard.recentResults?.length" class="activity-list">
              <div
                v-for="result in dashboard.recentResults"
                :key="result.tournamentId"
                class="activity-row"
              >
                <div class="result-icon">
                  <i class="mdi mdi-trophy"></i>
                </div>

                <div class="activity-info">
                  <strong>{{ result.tournamentName }}</strong>
                  <span>Winner: {{ result.winner || "Not entered" }}</span>
                </div>

                <span class="activity-date">{{ formatDate(result.date) }}</span>
              </div>
            </div>

            <div v-else class="empty-state small">
              <i class="mdi mdi-medal-outline"></i>
              <p>No tournament results yet.</p>
            </div>
          </div>
        </section>

        <section class="quick-actions">
          <div class="section-header">
            <div>
              <h3>Quick actions</h3>
              <p>Manage your tournaments faster.</p>
            </div>
          </div>

          <div class="action-grid">
            <router-link to="/tournaments/create" class="action-card">
              <div class="action-icon">
                <i class="mdi mdi-plus-circle-outline"></i>
              </div>

              <div class="action-info">
                <strong>Create tournament</strong>
                <span>Start a new competition.</span>
              </div>

              <i class="mdi mdi-arrow-right action-arrow"></i>
            </router-link>

            <router-link to="/my-tournaments" class="action-card">
              <div class="action-icon">
                <i class="mdi mdi-trophy-outline"></i>
              </div>

              <div class="action-info">
                <strong>Manage tournaments</strong>
                <span>Edit and manage your competitions.</span>
              </div>

              <i class="mdi mdi-arrow-right action-arrow"></i>
            </router-link>

            <router-link to="/tournaments" class="action-card">
              <div class="action-icon">
                <i class="mdi mdi-magnify"></i>
              </div>

              <div class="action-info">
                <strong>Browse tournaments</strong>
                <span>View competitions across the platform.</span>
              </div>

              <i class="mdi mdi-arrow-right action-arrow"></i>
            </router-link>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../store/auth";
import api from "../services/api";

const auth = useAuthStore();

const dashboard = ref({
  organizerStats: {
    totalTournaments: 0,
    activeTournaments: 0,
    totalParticipants: 0,
    completedTournaments: 0,
  },
  statusCounts: {
    upcoming: 0,
    live: 0,
    ended: 0,
  },
  nextTournament: null,
  tournaments: [],
  recentRegistrations: [],
  recentResults: [],
});

const loading = ref(true);
const error = ref("");

const username = computed(() => auth.user?.username || "Organizer");

const loadDashboard = async () => {
  try {
    loading.value = true;
    error.value = "";

    const res = await api.get("/organizer/dashboard");
    dashboard.value = res.data;
  } catch (err) {
    console.error("Failed to load organizer dashboard:", err);
    error.value = err.response?.data?.message || "Failed to load dashboard.";
  } finally {
    loading.value = false;
  }
};

const tournamentPlayers = (tournament) => {
  if (Array.isArray(tournament?.participants)) return tournament.participants.length;
  return tournament?.players ?? 0;
};

const capacityPercent = (tournament) => {
  const maxPlayers = Number(tournament?.maxPlayers) || 0;
  const players = tournamentPlayers(tournament);

  if (!maxPlayers) return 0;

  return Math.min(Math.round((players / maxPlayers) * 100), 100);
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const initial = (name) => {
  return name?.charAt(0).toUpperCase() || "?";
};

const statusClass = (status) => {
  return String(status || "").toLowerCase();
};

onMounted(loadDashboard);
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #080a0c;
  color: #fff;
}

.bg-blur,
.bg-blur-second {
  position: fixed;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: rgba(75, 222, 75, 0.06);
  filter: blur(130px);
  pointer-events: none;
}

.bg-blur {
  top: 80px;
  right: -120px;
}

.bg-blur-second {
  bottom: -150px;
  left: -160px;
}

.dashboard-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 120px 0 60px;
  position: relative;
  z-index: 1;
}

.dashboard-loading,
.dashboard-error {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.55);
}

.dashboard-loading i {
  color: #4bde4b;
  font-size: 24px;
}

.dashboard-error {
  color: #ff6b6b;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
}

.tag {
  margin: 0 0 8px;
  color: #4bde4b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.08;
}

.page-header h1 span {
  color: #4bde4b;
}

.subtitle {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}

.create-btn,
.manage-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 9px;
  background: #4bde4b;
  color: #071007;
  text-decoration: none;
  font-weight: 700;
  transition: 0.2s ease;
}

.create-btn {
  padding: 12px 17px;
  white-space: nowrap;
}

.manage-btn {
  align-self: flex-start;
  margin-top: 3px;
  padding: 10px 14px;
  font-size: 12px;
}

.create-btn:hover,
.manage-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(75, 222, 75, 0.15);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card,
.dashboard-card,
.action-card {
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(16px);
  border-radius: 13px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
}

.stat-icon,
.tournament-icon,
.action-icon,
.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
}

.stat-icon {
  width: 42px;
  height: 42px;
  font-size: 19px;
}

.stat-card > div:last-child {
  display: flex;
  flex-direction: column;
}

.stat-card strong {
  font-size: 21px;
}

.stat-card span {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(250px, 0.7fr);
  gap: 18px;
  margin-bottom: 18px;
}

.dashboard-card {
  padding: 20px;
  min-width: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.section-header h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.36);
  font-size: 11px;
}

.section-header > a {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #4bde4b;
  font-size: 11px;
  text-decoration: none;
}

.header-icon {
  color: #4bde4b;
  font-size: 20px;
}

.next-content {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.next-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.next-top h2 {
  margin: 0 0 4px;
  font-size: 21px;
}

.next-top p {
  margin: 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 68px;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.status-badge.upcoming {
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.08);
}

.status-badge.live {
  color: #ff6565;
  background: rgba(255, 101, 101, 0.08);
}

.status-badge.ended {
  color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.05);
}

.next-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.next-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 11px;
}

.next-meta i {
  color: #4bde4b;
}

.capacity {
  max-width: 460px;
}

.capacity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
}

.progress {
  height: 5px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #4bde4b;
}

.status-list {
  display: flex;
  flex-direction: column;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.status-row > div {
  display: flex;
  align-items: center;
  gap: 9px;
}

.status-row span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
}

.status-row strong {
  font-size: 14px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-dot.upcoming {
  background: #4bde4b;
}

.status-dot.live {
  background: #ff6565;
}

.status-dot.ended {
  background: rgba(255, 255, 255, 0.25);
}

.status-total {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
}

.status-total strong {
  color: #fff;
  font-size: 14px;
}

.tournaments-card {
  margin-bottom: 18px;
}

.tournament-list {
  display: flex;
  flex-direction: column;
}

.tournament-row {
  display: grid;
  grid-template-columns: 38px minmax(170px, 1fr) 110px 80px 80px 32px;
  align-items: center;
  gap: 13px;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tournament-row:last-child {
  border-bottom: 0;
}

.tournament-icon {
  width: 38px;
  height: 38px;
}

.tournament-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.tournament-info strong {
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tournament-info span,
.tournament-detail span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 9px;
}

.tournament-detail {
  display: flex;
  flex-direction: column;
}

.tournament-detail strong {
  margin-top: 3px;
  font-size: 10px;
  font-weight: 500;
}

.row-action {
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.04);
  text-decoration: none;
  transition: 0.2s ease;
}

.row-action:hover {
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.activity-row:last-child {
  border-bottom: 0;
}

.player-avatar,
.result-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
  font-size: 12px;
  font-weight: 700;
}

.activity-info {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.activity-info strong {
  font-size: 11px;
  font-weight: 600;
}

.activity-info span,
.activity-date {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 9px;
}

.activity-date {
  flex-shrink: 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
  color: #fff;
  transition: 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: rgba(75, 222, 75, 0.2);
  background: rgba(75, 222, 75, 0.035);
}

.action-icon {
  width: 40px;
  height: 40px;
  font-size: 18px;
}

.action-info {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.action-info strong {
  font-size: 12px;
  font-weight: 600;
}

.action-info span {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 9px;
}

.action-arrow {
  color: rgba(255, 255, 255, 0.25);
}

.empty-state {
  min-height: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
}

.empty-state.small,
.empty-state.compact {
  min-height: 120px;
}

.empty-state > i {
  margin-bottom: 8px;
  color: rgba(75, 222, 75, 0.55);
  font-size: 27px;
}

.empty-state strong {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.empty-state p {
  max-width: 320px;
  margin: 5px 0 9px;
  font-size: 10px;
}

.empty-state a {
  color: #4bde4b;
  font-size: 10px;
  text-decoration: none;
}

@media (max-width: 950px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .overview-grid,
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .tournament-row {
    grid-template-columns: 38px minmax(0, 1fr) 80px 32px;
  }

  .tournament-date,
  .tournament-detail:nth-of-type(3) {
    display: none;
  }
}

@media (max-width: 700px) {
  .dashboard-container {
    width: min(100% - 24px, 1180px);
    padding-top: 100px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }

  .create-btn {
    width: 100%;
  }

  .tournament-row {
    grid-template-columns: 36px minmax(0, 1fr) 32px;
  }

  .tournament-row > .status-badge,
  .tournament-detail {
    display: none;
  }
}
</style>
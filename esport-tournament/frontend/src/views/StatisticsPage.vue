<template>
  <div class="statistics-page">
    <div class="statistics-container">
      <div class="page-header">
        <div>
          <span class="eyebrow">ADMIN PANEL</span>
          <h1>Application Statistics</h1>
          <p>Overview of users, roles and tournament activity across the platform.</p>
        </div>

        <div class="header-icon">
          <i class="mdi mdi-chart-box-outline"></i>
        </div>
      </div>

      <div v-if="loading" class="state-card">
        <i class="mdi mdi-loading mdi-spin"></i>
        <span>Loading statistics...</span>
      </div>

      <template v-else>
        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-account-group-outline"></i></div>
            <div>
              <span>Total users</span>
              <strong>{{ totalUsers }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-gamepad-variant-outline"></i></div>
            <div>
              <span>Players</span>
              <strong>{{ totalPlayers }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-shield-account-outline"></i></div>
            <div>
              <span>Organizers</span>
              <strong>{{ totalOrganizers }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-account-cog-outline"></i></div>
            <div>
              <span>Admins</span>
              <strong>{{ totalAdmins }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-trophy-outline"></i></div>
            <div>
              <span>Total tournaments</span>
              <strong>{{ totalTournaments }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-broadcast"></i></div>
            <div>
              <span>Active tournaments</span>
              <strong>{{ activeTournaments }}</strong>
            </div>
          </div>
        </section>

        <section class="details-grid">
          <div class="details-card">
            <div class="section-header">
              <div>
                <span class="section-label">USERS</span>
                <h2>Role distribution</h2>
              </div>
              <i class="mdi mdi-account-multiple-outline"></i>
            </div>

            <div class="distribution-list">
              <div class="distribution-row">
                <div class="distribution-name">
                  <span class="dot player-dot"></span>
                  <span>Players</span>
                </div>

                <div class="distribution-value">
                  <strong>{{ totalPlayers }}</strong>
                  <span>{{ userPercentage(totalPlayers) }}%</span>
                </div>
              </div>

              <div class="progress">
                <div class="progress-bar" :style="{ width: userPercentage(totalPlayers) + '%' }"></div>
              </div>

              <div class="distribution-row">
                <div class="distribution-name">
                  <span class="dot organizer-dot"></span>
                  <span>Organizers</span>
                </div>

                <div class="distribution-value">
                  <strong>{{ totalOrganizers }}</strong>
                  <span>{{ userPercentage(totalOrganizers) }}%</span>
                </div>
              </div>

              <div class="progress">
                <div class="progress-bar" :style="{ width: userPercentage(totalOrganizers) + '%' }"></div>
              </div>

              <div class="distribution-row">
                <div class="distribution-name">
                  <span class="dot admin-dot"></span>
                  <span>Admins</span>
                </div>

                <div class="distribution-value">
                  <strong>{{ totalAdmins }}</strong>
                  <span>{{ userPercentage(totalAdmins) }}%</span>
                </div>
              </div>

              <div class="progress">
                <div class="progress-bar" :style="{ width: userPercentage(totalAdmins) + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="details-card">
            <div class="section-header">
              <div>
                <span class="section-label">TOURNAMENTS</span>
                <h2>Status overview</h2>
              </div>
              <i class="mdi mdi-chart-donut"></i>
            </div>

            <div class="status-list">
              <div class="status-row">
                <div>
                  <span class="status-dot upcoming"></span>
                  <span>Upcoming</span>
                </div>
                <strong>{{ upcomingTournaments }}</strong>
              </div>

              <div class="status-row">
                <div>
                  <span class="status-dot live"></span>
                  <span>Live</span>
                </div>
                <strong>{{ liveTournaments }}</strong>
              </div>

              <div class="status-row">
                <div>
                  <span class="status-dot ended"></span>
                  <span>Ended</span>
                </div>
                <strong>{{ endedTournaments }}</strong>
              </div>
            </div>

            <div class="total-row">
              <span>Total tournaments</span>
              <strong>{{ totalTournaments }}</strong>
            </div>
          </div>
        </section>

        <section class="summary-card">
          <div class="section-header">
            <div>
              <span class="section-label">PLATFORM</span>
              <h2>Platform summary</h2>
            </div>
            <i class="mdi mdi-monitor-dashboard"></i>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <i class="mdi mdi-account-plus-outline"></i>
              <div>
                <span>Registered users</span>
                <strong>{{ totalUsers }}</strong>
              </div>
            </div>

            <div class="summary-item">
              <i class="mdi mdi-trophy-outline"></i>
              <div>
                <span>Created tournaments</span>
                <strong>{{ totalTournaments }}</strong>
              </div>
            </div>

            <div class="summary-item">
              <i class="mdi mdi-broadcast"></i>
              <div>
                <span>Currently active</span>
                <strong>{{ liveTournaments }}</strong>
              </div>
            </div>

            <div class="summary-item">
              <i class="mdi mdi-calendar-clock-outline"></i>
              <div>
                <span>Upcoming</span>
                <strong>{{ upcomingTournaments }}</strong>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../services/api";

const users = ref([]);
const tournaments = ref([]);
const loading = ref(true);

const loadStatistics = async () => {
  try {
    const [usersRes, tournamentsRes] = await Promise.all([
      api.get("/users"),
      api.get("/tournaments")
    ]);

    users.value = usersRes.data;
    tournaments.value = tournamentsRes.data;
  } catch (err) {
    console.error("Failed to load statistics:", err);

    alert(
      err.response?.data?.message ||
      "Failed to load statistics"
    );
  } finally {
    loading.value = false;
  }
};

const totalUsers = computed(() => users.value.length);

const totalPlayers = computed(() =>
  users.value.filter(user => user.role === "player").length
);

const totalOrganizers = computed(() =>
  users.value.filter(user => user.role === "organizer").length
);

const totalAdmins = computed(() =>
  users.value.filter(user => user.role === "admin").length
);

const totalTournaments = computed(() => tournaments.value.length);

const upcomingTournaments = computed(() =>
  tournaments.value.filter(tournament => tournament.status === "UPCOMING").length
);

const liveTournaments = computed(() =>
  tournaments.value.filter(tournament => tournament.status === "LIVE").length
);

const endedTournaments = computed(() =>
  tournaments.value.filter(tournament => tournament.status === "ENDED").length
);

const activeTournaments = computed(() =>
  upcomingTournaments.value + liveTournaments.value
);

const userPercentage = count => {
  if (!totalUsers.value) return 0;
  return Math.round((count / totalUsers.value) * 100);
};

onMounted(loadStatistics);
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  padding: 110px 24px 60px;
  background:
    radial-gradient(circle at 15% 10%, rgba(75,222,75,.08), transparent 35%),
    radial-gradient(circle at 90% 25%, rgba(0,140,255,.04), transparent 35%),
    #0b0c10;
  color: white;
}

.statistics-container {
  max-width: 1120px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 30px;
}

.eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #4BDE4B;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 48px);
  letter-spacing: -1px;
}

.page-header p {
  max-width: 560px;
  margin: 10px 0 0;
  color: rgba(255,255,255,.48);
  font-size: 12px;
  line-height: 1.6;
  padding: 12px;
}

.header-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(75,222,75,.16);
  border-radius: 16px;
  background: rgba(75,222,75,.06);
  color: #4BDE4B;
  font-size: 27px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card,
.details-card,
.summary-card {
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px;
  background: rgba(18,20,27,.9);
  box-shadow: 0 15px 40px rgba(0,0,0,.14);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px;
  transition: .2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(75,222,75,.18);
}

.stat-icon {
  width: 41px;
  height: 41px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(75,222,75,.07);
  color: #4BDE4B;
  font-size: 19px;
}

.stat-card > div:last-child {
  display: flex;
  flex-direction: column;
}

.stat-card span {
  color: rgba(255,255,255,.4);
  font-size: 13px;
}

.stat-card strong {
  margin-top: 2px;
  font-size: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.details-card,
.summary-card {
  padding: 21px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.section-label {
  color: #4BDE4B;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.section-header h2 {
  margin: 4px 0 0;
  font-size: 16px;
}

.section-header > i {
  color: rgba(75,222,75,.65);
  font-size: 21px;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.distribution-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.distribution-name,
.distribution-value {
  display: flex;
  align-items: center;
}

.distribution-name {
  gap: 8px;
  color: rgba(255,255,255,.55);
  font-size: 14px;
}

.distribution-value {
  gap: 8px;
}

.distribution-value strong {
  font-size: 11px;
}

.distribution-value span {
  color: rgba(255,255,255,.3);
  font-size: 12px;
}

.dot,
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.player-dot {
  background: #8fc7ff;
}

.organizer-dot {
  background: #4BDE4B;
}

.admin-dot {
  background: #ffd166;
}

.progress {
  height: 5px;
  margin-bottom: 9px;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255,255,255,.05);
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: #4BDE4B;
}

.status-list {
  display: flex;
  flex-direction: column;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.status-row > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-row span {
  color: rgba(255,255,255,.52);
  font-size: 14px;
}

.status-row strong {
  font-size: 12px;
}

.status-dot.upcoming {
  background: #4BDE4B;
}

.status-dot.live {
  background: #ff6666;
}

.status-dot.ended {
  background: rgba(255,255,255,.28);
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  color: rgba(255,255,255,.42);
  font-size: 12px;
}

.total-row strong {
  color: white;
  font-size: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px;
  border-radius: 10px;
  background: rgba(255,255,255,.025);
}

.summary-item > i {
  color: #4BDE4B;
  font-size: 18px;
}

.summary-item > div {
  display: flex;
  flex-direction: column;
}

.summary-item span {
  color: rgba(255,255,255,.35);
  font-size: 13px;
}

.summary-item strong {
  margin-top: 2px;
  font-size: 13px;
}

.state-card {
  min-height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 16px;
  background: #12141b;
  color: rgba(255,255,255,.5);
  font-size: 11px;
}

.state-card i {
  color: #4BDE4B;
  font-size: 21px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .statistics-page {
    padding: 90px 15px 40px;
  }

  .header-icon {
    display: none;
  }

  .stats-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
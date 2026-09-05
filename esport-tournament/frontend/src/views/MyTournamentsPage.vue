<template>
  <div class="my-tournaments-page">
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">PLAYER AREA</p>
        <h1>My <span>Tournaments</span></h1>
        <br><p>Track your registered tournaments, live competitions and results.</p>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-trophy-outline"></i></div>
            <div>
              <strong>{{ tournaments.length }}</strong>
              <span>Total tournaments</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-calendar-clock-outline"></i></div>
            <div>
              <strong>{{ upcomingCount }}</strong>
              <span>Upcoming</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-broadcast"></i></div>
            <div>
              <strong>{{ liveCount }}</strong>
              <span>Live</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="mdi mdi-check-circle-outline"></i></div>
            <div>
              <strong>{{ completedCount }}</strong>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main class="content">
      <div class="toolbar">
        <div class="tabs">
          <button :class="{ active: selectedStatus === '' }" @click="selectedStatus = ''">All</button>
          <button :class="{ active: selectedStatus === 'UPCOMING' }" @click="selectedStatus = 'UPCOMING'">Upcoming</button>
          <button :class="{ active: selectedStatus === 'LIVE' }" @click="selectedStatus = 'LIVE'">Live</button>
          <button :class="{ active: selectedStatus === 'ENDED' }" @click="selectedStatus = 'ENDED'">Completed</button>
        </div>

        <div class="search">
          <i class="mdi mdi-magnify"></i>
          <input v-model="search" type="text" placeholder="Search tournaments..." />
        </div>
      </div>

      <div v-if="loading" class="state-card">
        <i class="mdi mdi-loading mdi-spin"></i>
        <p>Loading your tournaments...</p>
      </div>

      <div v-else-if="error" class="state-card error">
        <i class="mdi mdi-alert-circle-outline"></i>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="filteredTournaments.length === 0" class="empty-state">
        <div class="empty-icon"><i class="mdi mdi-trophy-outline"></i></div>
        <h2>No tournaments found</h2>
        <p v-if="tournaments.length === 0">You haven't joined any tournaments yet.</p>
        <p v-else>No tournaments match the selected filters.</p>

        <router-link v-if="tournaments.length === 0" to="/tournaments" class="explore-btn">
          <i class="mdi mdi-compass-outline"></i>Explore tournaments
        </router-link>
      </div>

      <section v-else class="tournament-grid">
        <article v-for="item in filteredTournaments" :key="item.participationId" class="tournament-card">
          <div class="card-top">
            <span class="status" :class="statusClass(item.tournament.status)">
              <span v-if="item.tournament.status === 'LIVE'" class="live-dot"></span>{{ item.tournament.status }}
            </span>

            <span class="game">{{ item.tournament.game?.name || "Unknown game" }}</span>
          </div>

          <div class="card-body">
            <h2>{{ item.tournament.name }}</h2>
            <p class="description">{{ item.tournament.description || "No tournament description available." }}</p>

            <div class="info-grid">
              <div class="info-item">
                <i class="mdi mdi-calendar-outline"></i>
                <div>
                  <span>Date</span>
                  <strong>{{ formatDate(item.tournament.date) }}</strong>
                </div>
              </div>

              <div class="info-item">
                <i class="mdi mdi-earth"></i>
                <div>
                  <span>Region</span>
                  <strong>{{ item.tournament.region || "Global" }}</strong>
                </div>
              </div>

              <div class="info-item">
                <i class="mdi mdi-cash"></i>
                <div>
                  <span>Prize</span>
                  <strong>{{ item.tournament.prize || "0" }}</strong>
                </div>
              </div>

              <div class="info-item">
                <i class="mdi mdi-account-group-outline"></i>
                <div>
                  <span>Players</span>
                  <strong>{{ getPlayers(item.tournament) }}/{{ item.tournament.maxPlayers }}</strong>
                </div>
              </div>
            </div>

            <div v-if="item.tournament.status === 'UPCOMING'" class="countdown">
              <i class="mdi mdi-clock-outline"></i>
              <span>Starts in <strong>{{ getTimeLeft(item.tournament.date) }}</strong></span>
            </div>

            <div v-if="item.tournament.status === 'ENDED' && item.placement" class="result">
              <div class="result-icon">
                <i :class="['mdi', item.placement === 1 ? 'mdi-trophy' : 'mdi-medal-outline']"></i>
              </div>

              <div>
                <span>Your placement</span>
                <strong>{{ formatPlacement(item.placement) }}</strong>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="participation-status">
              <span>Registration</span>
              <strong><i class="mdi mdi-check-circle-outline"></i>{{ formatParticipationStatus(item.status) }}</strong>
            </div>

            <div class="card-actions">
              <button v-if="item.tournament.status !== 'ENDED'" class="leave-btn" @click="leaveTournament(item.tournament._id)">
                <i class="mdi mdi-logout-variant"></i>Leave tournament</button>

              <router-link :to="`/tournaments/${item.tournament._id}`" class="details-btn">View tournament
                <i class="mdi mdi-arrow-right"></i>
              </router-link>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../services/api";

const tournaments = ref([]);
const search = ref("");
const selectedStatus = ref("");
const loading = ref(true);
const error = ref("");

const loadTournaments = async () => {
  try {
    loading.value = true;
    error.value = "";

    const res = await api.get("/participations/me");
    tournaments.value = res.data;
  } catch (err) {
    console.error("Failed to load player tournaments:", err);

    error.value = err.response?.data?.message || "Failed to load your tournaments.";
  } finally {
    loading.value = false;
  }
};

const filteredTournaments = computed(() => {
  return tournaments.value.filter(item => {
    if (!item.tournament) return false;

    const gameName = item.tournament.game?.name || "";

    const matchesSearch =
      item.tournament.name.toLowerCase().includes(search.value.toLowerCase()) ||
      gameName.toLowerCase().includes(search.value.toLowerCase());

    const matchesStatus = selectedStatus.value
      ? item.tournament.status === selectedStatus.value
      : true;

    return matchesSearch && matchesStatus;
  });
});

const upcomingCount = computed(() => {
  return tournaments.value.filter(item => item.tournament?.status === "UPCOMING").length;
});

const liveCount = computed(() => {
  return tournaments.value.filter(item => item.tournament?.status === "LIVE").length;
});

const completedCount = computed(() => {
  return tournaments.value.filter(item => item.tournament?.status === "ENDED").length;
});

const formatDate = date => {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getPlayers = tournament => {
  if (Array.isArray(tournament.participants)) return tournament.participants.length;
  return tournament.players || 0;
};

const getTimeLeft = date => {
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;

  if (diff <= 0) return "Started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  return `${days}d ${hours}h`;
};

const formatPlacement = placement => {
  if (placement === 1) return "1st place";
  if (placement === 2) return "2nd place";
  if (placement === 3) return "3rd place";
  return `${placement}th place`;
};

const formatParticipationStatus = status => {
  if (status === "registered") return "Registered";
  if (status === "playing") return "Playing";
  if (status === "finished") return "Finished";
  return status;
};

const statusClass = status => String(status || "").toLowerCase();

const leaveTournament = async id => {
  const confirmed = confirm("Are you sure you want to leave this tournament?");

  if (!confirmed) return;

  try {
    const res = await api.delete(`/tournaments/${id}/leave`);

    alert(res.data.message);

    await loadTournaments();
  } catch (err) {
    console.error("Failed to leave tournament:", err);

    alert(
      err.response?.data?.message ||
      "Failed to leave tournament"
    );
  }
};

onMounted(loadTournaments);
</script>

<style scoped>
.my-tournaments-page {
  min-height: 100vh;
  background: #090b10;
  color: #fff;
}

.hero {
  padding: 135px 0 40px;
  background: radial-gradient(circle at 20% 20%, rgba(75, 222, 75, 0.07), transparent 32%);
}

.hero-content,
.content {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.eyebrow {
  margin: 0 0 8px;
  color: #4bde4b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.hero h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 50px);
}

.hero h1 span {
  color: #4bde4b;
}

.hero-content > p:last-of-type {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
}

.stat-icon {
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
}

.stat-icon i {
  font-size: 18px;
}

.stat-card > div:last-child {
  display: flex;
  flex-direction: column;
}

.stat-card strong {
  font-size: 18px;
}

.stat-card span {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
}

.content {
  padding: 25px 0 60px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.tabs {
  display: flex;
  gap: 5px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.02);
}

.tabs button {
  padding: 8px 13px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
}

.tabs button.active {
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.08);
}

.search {
  position: relative;
  width: 250px;
}

.search i {
  position: absolute;
  top: 50%;
  left: 12px;
  color: rgba(255, 255, 255, 0.25);
  transform: translateY(-50%);
}

.search input {
  width: 100%;
  height: 39px;
  box-sizing: border-box;
  padding: 0 12px 0 36px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  outline: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
  color: #fff;
  font-family: inherit;
  font-size: 14px;
}

.search input:focus {
  border-color: rgba(75, 222, 75, 0.3);
}

.search input::placeholder {
  color: rgba(255, 255, 255, 0.22);
}

.tournament-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.tournament-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  background: #111319;
  transition: 0.25s ease;
}

.tournament-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, transparent, rgba(75, 222, 75, 0.06), transparent);
  opacity: 0;
  pointer-events: none;
  transition: 0.25s;
}

.tournament-card:hover {
  transform: translateY(-4px);
  border-color: rgba(75, 222, 75, 0.18);
}

.tournament-card:hover::before {
  opacity: 1;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 19px 0;
}

.status,
.game {
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.status {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status.upcoming {
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
}

.status.live {
  color: #ff6262;
  background: rgba(255, 98, 98, 0.07);
}

.status.ended {
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.game {
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.035);
}

.card-body {
  padding: 18px 19px;
}

.card-body h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.description {
  min-height: 35px;
  margin: 7px 0 17px;
  color: rgba(255, 255, 255, 0.34);
  font-size: 12px;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
}

.info-item > i {
  color: #4bde4b;
  font-size: 18px;
}

.info-item > div {
  display: flex;
  flex-direction: column;
}

.info-item span {
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
}

.info-item strong {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 500;
}

.countdown,
.result {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 13px;
  padding: 11px;
  border-radius: 8px;
}

.countdown {
  color: rgba(255, 255, 255, 0.45);
  background: rgba(75, 222, 75, 0.035);
  font-size: 12px;
}

.countdown i,
.countdown strong {
  color: #4bde4b;
}

.result {
  background: rgba(75, 222, 75, 0.04);
}

.result-icon {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.08);
}

.result > div:last-child {
  display: flex;
  flex-direction: column;
}

.result span {
  color: rgba(255, 255, 255, 0.3);
  font-size: 8px;
}

.result strong {
  margin-top: 2px;
  font-size: 11px;
}

.card-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 13px 19px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.08);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 13px;
}

.leave-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 110, 110, 0.65);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s ease;
}

.leave-btn:hover {
  color: #ff6e6e;
}

.leave-btn i {
  font-size: 13px;
}

.participation-status {
  display: flex;
  flex-direction: column;
}

.participation-status span {
  color: rgba(255, 255, 255, 0.25);
  font-size: 10px;
}

.participation-status strong {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  color: #4bde4b;
  font-size: 10px;
  font-weight: 500;
}

.details-btn,
.explore-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  transition: 0.2s ease;
}

.details-btn {
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
}

.details-btn:hover {
  color: #4bde4b;
}

.state-card,
.empty-state {
  padding: 55px 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.02);
  text-align: center;
}

.state-card.error i,
.state-card.error p {
  color: #ff6f6f;
}

.empty-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  border-radius: 12px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
}

.empty-icon i {
  font-size: 23px;
}

.empty-state h2 {
  margin: 0;
  font-size: 17px;
}

.empty-state p {
  margin: 7px 0 17px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 10px;
}

.explore-btn {
  min-height: 39px;
  padding: 0 14px;
  border-radius: 7px;
  color: #081008;
  background: #4bde4b;
  font-size: 10px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .tournament-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .hero-content,
  .content {
    width: calc(100% - 24px);
  }

  .hero {
    padding-top: 105px;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .tabs {
    overflow-x: auto;
  }

  .search {
    width: 100%;
  }
}

@media (max-width: 450px) {
  .stats,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
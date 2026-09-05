<template>
  <div class="tournaments-page">
    <section class="hero">
      <div class="hero-content">
        <h1>Esports Tournaments</h1>
        <p>Join competitive events, climb ranks and win prizes.</p>
        <div class="filters">
  <div class="search-filter">
    <i class="mdi mdi-magnify"></i>
    <input v-model="search" placeholder="Search tournaments..." />
  </div>

  <div class="filter-divider"></div>

  <div class="select-filter">
    <i class="mdi mdi-signal"></i>
    <select v-model="statusFilter">
      <option value="">All statuses</option>
      <option value="LIVE">Live</option>
      <option value="UPCOMING">Upcoming</option>
      <option value="ENDED">Ended</option>
    </select>
    <i class="mdi mdi-chevron-down select-arrow"></i>
  </div>

  <div class="filter-divider"></div>

  <div class="select-filter">
    <i class="mdi mdi-controller-classic-outline"></i>
    <select v-model="gameFilter">
      <option value="">All games</option>
      <option v-for="game in games" :key="game._id" :value="game.name">{{ game.name }}</option>
    </select>
    <i class="mdi mdi-chevron-down select-arrow"></i>
  </div>
</div>
      </div>
    </section>

    <section v-if="view === 'tournaments' && featuredTournament" class="featured">
      <div class="featured-card">

        <div class="badge">🔥 FEATURED</div>

        <h2>{{ featuredTournament.name }}</h2>
        <p>{{ featuredTournament.description }}</p>

        <div class="featured-meta">
          <span>💰 {{ featuredTournament.prize }}</span>
          <span>📅 {{ featuredTournament.date }}</span>
          <span>🌍 {{ featuredTournament.region }}</span>
        </div>

        <button class="btn" @click="joinTournament(featuredTournament._id)">Join Now</button>
      </div>
    </section>

    <section v-if="view === 'tournaments'" class="grid">

      <div v-for="t in filteredTournaments" :key="t._id" class="card">

        <div class="top">
          <span class="status" :class="t.status">
            <span v-if="t.status === 'LIVE'" class="dot"></span>{{ t.status }}
          </span>

          <span class="game">{{ t.game?.name || "Unknown game" }}</span>
        </div>

        <h3>{{ t.name }}</h3>
        <p class="desc">{{ t.description }}</p>

        <p v-if="t.status === 'UPCOMING'" class="countdown">Starts in: {{ t.startsIn }}</p>

        <div class="progress">
          <div class="bar" :style="{ width: getProgress(t) + '%' }"></div>
        </div>

        <div class="meta">
          <span>💰 {{ t.prize }}</span>
          <span>👥 {{ t.players }}/{{ t.maxPlayers }}</span>
        </div>

        <div class="meta">
          <span>📅 {{ t.date }}</span>
          <span>🌍 {{ t.region }}</span>
        </div>

        <button v-if="auth.role !== 'organizer' && auth.role !== 'admin'" class="btn" :disabled="t.status == 'ENDED'" @click="ApplyToTournament(t._id)">
          <i :class="['mdi', t.status === 'LIVE' ? 'mdi-broadcast' : t.status === 'ENDED' ? 'mdi-check-circle-outline' : 'mdi-login-variant']"></i>Apply to Tournament</button>

          <div v-if="isOwner(t)" class="organizer-actions">
            <button class="edit-btn" @click="editTournament(t._id)">
              <i class="mdi mdi-pencil-outline"></i>Edit
            </button>

            <button class="delete-btn" @click="deleteTournament(t)">
              <i class="mdi mdi-delete-outline"></i>Delete
            </button>
          </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { useAuthStore } from "../store/auth";

const tournaments = ref([]);
const games = ref([]);
const search = ref("");
const statusFilter = ref("");
const gameFilter = ref("");
const view = ref("tournaments");

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loadGames = async () => {
  try {
    const res = await api.get("/games");
    games.value = res.data;
  } catch (err) {
    console.error("Failed to load games:", err);
  }
};

const load = async () => {
  try {
    const res = await api.get("/tournaments");
    console.log("Tournaments response:", res.data);

    tournaments.value = res.data.map(t => ({
      ...t,
      startsIn: getTimeLeft(t.date)
    }));
  } catch (err) {
    console.error("Failed to load tournaments:", err);
  }
};

const filteredTournaments = computed(() => {
  const selectedGame = route.query.game || "";
  const searchValue = search.value.toLowerCase();

  return tournaments.value.filter(t => {
    const gameName = t.game?.name || "";

    const matchSearch =
      t.name?.toLowerCase().includes(searchValue) ||
      gameName.toLowerCase().includes(searchValue);

    const matchStatus =
      !statusFilter.value ||
      t.status === statusFilter.value;

    const matchGameFilter =
      !gameFilter.value ||
      gameName === gameFilter.value;

    const matchRouteGame =
      !selectedGame ||
      gameName === selectedGame;

    return matchSearch && matchStatus && matchGameFilter && matchRouteGame;
  });
});

const getTimeLeft = dateStr => {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;

  if (diff <= 0) return "Started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  return `${days}d ${hours}h`;
};

const ApplyToTournament = async id => {
  if (!auth.isAuthenticated) {
    router.push({
      path: "/login",
      query: { redirect: "/tournaments" }
    });
    return;
  }

  if (auth.role !== "player") {
    alert("Only players can apply to tournaments!");
    return;
  }

  try {
    const res = await api.post(`/enrollments/tournaments/${id}`);
    alert(res.data.message);
    await load();
  } catch (err) {
    console.error("Failed to apply to tournament:", err);

    if (err.response) {
      alert(err.response.data.message || "Failed to apply to tournament");
    } else {
      alert("Server is not responding.");
    }
  }
};

const getProgress = t => {
  if (!t.maxPlayers || t.maxPlayers <= 0) return 0;

  const progress = (t.players / t.maxPlayers) * 100;
  return Math.min(progress, 100);
};

const isOwner = tournament => {
  if (!auth.user || auth.role !== "organizer") return false;

  const currentUserId = auth.user._id || auth.user.id;
  const organizerId = tournament.organizer?._id || tournament.organizer;

  return String(currentUserId) === String(organizerId);
};

const editTournament = id => {
  router.push(`/tournaments/${id}/edit`);
};

const deleteTournament = async tournament => {
  const confirmed = confirm(
    `Are you sure you want to delete "${tournament.name}"?`
  );

  if (!confirmed) return;

  try {
    const res = await api.delete(`/tournaments/${tournament._id}`);
    alert(res.data.message);

    tournaments.value = tournaments.value.filter(
      t => t._id !== tournament._id
    );
  } catch (err) {
    console.error("Failed to delete tournament:", err);
    alert(err.response?.data?.message || "Failed to delete tournament");
  }
};

watch(gameFilter, () => {
  if (route.query.game) {
    router.replace({
      path: "/tournaments"
    });
  }
});

onMounted(async () => {
  await Promise.all([
    load(),
    loadGames()
  ]);
});
</script>

<style scoped>
.tournaments-page {
  min-height: 100vh;
  padding: 90px 50px;
  background: #0b0c10;
  color: white;

  background:
    radial-gradient(circle at 20% 10%, rgba(75,222,75,0.08), transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(0,150,255,0.06), transparent 50%),
    #0b0c10;
}

.hero {
  padding: 28x 0 34px;
}

.hero-content h1 {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
  color: #4BDE4B;
  text-shadow: 0 0 25px rgba(75,222,75,.25);
  padding: 20px
}

.hero-content p {
  opacity: .8;
  margin-top: 30px;
}

.filters {
  width: min(900px, 100%);
  display: flex;
  align-items: center;
  margin: 38px auto 0;
  padding: 8px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px;
  background: rgba(18,20,27,.88);
  backdrop-filter: blur(18px);
  box-shadow:
    0 18px 45px rgba(0,0,0,.22),
    0 0 30px rgba(75,222,75,.025);
}

.search-filter,
.select-filter {
  position: relative;
  display: flex;
  align-items: center;
}

.search-filter {
  flex: 1;
  min-width: 280px;
}

.search-filter > i,
.select-filter > i:first-child {
  position: absolute;
  left: 15px;
  z-index: 2;
  color: rgba(255,255,255,.35);
  font-size: 17px;
  pointer-events: none;
  transition: .2s ease;
}

.search-filter input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 44px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: white;
  font-family: inherit;
  font-size: 13px;
  outline: none;
}

.search-filter input::placeholder {
  color: rgba(255,255,255,.3);
}

.search-filter:focus-within {
  background: rgba(75,222,75,.035);
  border-radius: 11px;
}

.search-filter:focus-within > i {
  color: #4BDE4B;
}

.select-filter {
  width: 190px;
}

.select-filter select {
  width: 100%;
  height: 48px;
  padding: 0 42px 0 43px;
  border: none;
  border-radius: 11px;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  color: rgba(255,255,255,.78);
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: .2s ease;
}

.select-filter:hover,
.select-filter:focus-within {
  background: rgba(255,255,255,.035);
  border-radius: 11px;
}

.select-filter:focus-within > i:first-child {
  color: #4BDE4B;
}

.select-filter select option {
  background: #12141b;
  color: white;
}

.select-arrow {
  position: absolute;
  right: 13px;
  color: rgba(255,255,255,.3);
  font-size: 17px;
  pointer-events: none;
}

.filter-divider {
  width: 1px;
  height: 27px;
  flex-shrink: 0;

  background: rgba(255,255,255,.07);
}

.featured {
  margin: 20px 0 50px 0;
}

.featured-card {
  background: linear-gradient(135deg, #12141b, #0f1116);
  border: 1px solid rgba(75,222,75,.3);
  padding: 25px;
  border-radius: 18px;
  box-shadow: 0 0 40px rgba(75,222,75,.15);
}

.badge {
  color: #4BDE4B;
  font-size: 12px;
  margin-bottom: 10px;
}

.featured-meta {
  display: flex;
  gap: 15px;
  margin: 15px 0;
  opacity: .8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, 340px);
  justify-content: center;
  gap: 25px;
  padding: 80px;
}

.card {
  background: #12141b;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid rgba(255,255,255,.06);
  transition: .3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 18px;
  padding: 1px;
  background: linear-gradient(135deg, transparent, rgba(75, 222, 75, .4), transparent);
  opacity: 0;
  transition: .3s;
  pointer-events: none;
}

.card:hover::before{
  opacity: 1;
}

.card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: rgba(75,222,75,.3);
  box-shadow: 0 0 25px rgba(75,222,75,.1);
}

.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
}

.status.LIVE {
  color: #4BDE4B;
  background: rgba(75,222,75,.15);
  box-shadow: 0 0 10px rgba(75, 222, 75, .3);
}

.status.UPCOMING {
  color: #aaa;
  background: rgba(255,255,255,.08);
}

.status.ENDED {
  color: #ff4d4d;
  background: rgba(255,0,0,.1);
}

.dot {
  width: 6px;
  height: 6px;
  background: #4BDE4B;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.8); opacity: .4; }
  100% { transform: scale(1); opacity: 1; }
}

h3 {
  margin: 0 0 8px 0;
}

.desc {
  opacity: .75;
  margin-bottom: 10px;
}

.countdown {
  font-size: 12px;
  opacity: .7;
}

.progress {
  height: 6px;
  background: rgba(255,255,255,.05);
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #4BDE4B, #00ff88);
  box-shadow: 0 0 10px rgba(75,222,75,.4);
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  opacity: .85;
  margin-top: 6px;
}

.btn {
  width: 100%;
  margin-top: 15px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: rgba(75,222,75,.15);
  color: #4BDE4B;
  font-weight: 600;
  cursor: pointer;
}

.btn:hover {
  background: #4BDE4B;
  color: #0b0c10;
}

.btn:disabled {
  opacity: .3;
  cursor: not-allowed;
}

.organizer-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s ease;
}

.edit-btn {
  border: 1px solid rgba(75,222,75,.25);
  background: rgba(75,222,75,.1);
  color: #4BDE4B;
}

.edit-btn:hover {
  background: #4BDE4B;
  color: #0b0c10;
}

.delete-btn {
  border: 1px solid rgba(255,77,77,.25);
  background: rgba(255,77,77,.08);
  color: #ff4d4d;
}

.delete-btn:hover {
  background: #ff4d4d;
  color: white;
}

</style>
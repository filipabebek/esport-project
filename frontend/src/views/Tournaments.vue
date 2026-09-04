<template>
  <div class="tournaments-page">

    <section class="hero">
      <div class="hero-content">
        <h1>Esports Tournaments</h1>
        <p>Join competitive events, climb ranks and win prizes.</p>

        <div class="filters">
          <input v-model="search" placeholder="Search tournaments..." />

          <select v-model="statusFilter">
            <option value="">All</option>
            <option value="LIVE">Live</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ENDED">Ended</option>
          </select>

          <select v-model="gameFilter">
            <option value="">All Games</option>
            <option value="CS2">CS2</option>
            <option value="Valorant">Valorant</option>
            <option value="LoL">LoL</option>
          </select>
        </div>
      </div>
    </section>

    <div class="tabs">
      <button :class="{ active: view === 'tournaments' }" @click="view = 'tournaments'">Tournaments</button>
    </div>

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

      <div
        v-for="t in filteredTournaments"
        :key="t._id"
        class="card"
      >

        <div class="top">
          <span class="status" :class="t.status">
            <span v-if="t.status === 'LIVE'" class="dot"></span>
            {{ t.status }}
          </span>

          <span class="game">{{ t.game }}</span>
        </div>

        <h3>{{ t.name }}</h3>
        <p class="desc">{{ t.description }}</p>

        <p v-if="t.status === 'UPCOMING'" class="countdown">
          Starts in: {{ t.startsIn }}
        </p>

        <div class="progress">
          <div
            class="bar"
            :style="{ width: getProgress(t) + '%' }"
          ></div>
        </div>

        <div class="meta">
          <span>💰 {{ t.prize }}</span>
          <span>👥 {{ t.players }}/{{ t.maxPlayers }}</span>
        </div>

        <div class="meta">
          <span>📅 {{ t.date }}</span>
          <span>🌍 {{ t.region }}</span>
        </div>

        <button class="btn" :disabled="t.status == 'ENDED'" @click="joinTournament(t._id)">{{ getButtonText(t)}}
        </button>

      </div>

    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { useAuthStore } from "../store/auth";

const tournaments = ref([]);

const search = ref("");
const statusFilter = ref("");
const gameFilter = ref("");
const view = ref("tournaments");

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const gameMap = {
  "CS2": "CS2",
  "CSGO": "CS2",
  "Counter-Strike": "CS2",
  "Valorant": "Valorant",
  "League of Legends": "League of Legends",
  "LoL": "League of Legends",
  "Dota 2": "Dota 2",
  "Fortnite": "Fortnite"
};

const normalizeGame = (game) => {
  return gameMap[game] || game;
};

const players = ref([
  { id: 1, name: "NovaX", team: "Shadow Guild", rank: "S", winRate: 78, points: 2450 },
  { id: 2, name: "ZeroKill", team: "Apex Unit", rank: "S", winRate: 74, points: 2320 },
  { id: 3, name: "Blitz", team: "Neon Squad", rank: "A+", winRate: 71, points: 2210 },
  { id: 4, name: "Raven", team: "Night Core", rank: "A", winRate: 69, points: 2105 },
  { id: 5, name: "CyberNinja", team: "Pixel Force", rank: "A", winRate: 66, points: 1980 }
]);

const load = async () => {
  try {
    const res = await api.get("/tournaments");

    tournaments.value = res.data.map(t => ({
    ...t,
    startsIn: getTimeLeft(t.date)
  }));
  } catch (err){
    console.error("Failed to load tournaments: ", err);
  }
};

const filteredTournaments = computed(() => {
  const selectedGame = route.query.game
    ? gameMap[route.query.game] || route.query.game
    : null;

  return tournaments.value.filter(t => {
    const matchSearch = t.name
      .toLowerCase()
      .includes(search.value.toLowerCase());

    const matchStatus = statusFilter.value
      ? t.status === statusFilter.value
      : true;

    const matchGameFilter = gameFilter.value
      ? normalizeGame(t.game) === normalizeGame(gameFilter.value)
      : true;

    const matchRouteGame = selectedGame
      ? normalizeGame(t.game) === normalizeGame(selectedGame)
      : true;

    return (
      matchSearch &&
      matchStatus &&
      matchGameFilter &&
      matchRouteGame
    );
  });
});

const getTimeLeft = (dateStr) => {
  const now = new Date();
  const target = new Date(dateStr);

  const diff = target - now;

  if (diff <= 0) return "Started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  return `${days}d ${hours}h`;
};

const getButtonText = (t) => {
  if (t.status === "LIVE") return "Watch / Join Live";
  if (t.status === "UPCOMING") return "Join Tournament";
  if (t.status === "ENDED") return "Tournament Ended";
  return "Join Tournament";
};

const joinTournament = async (id) => {
  if (!auth.isAuthenticated){
    router.push({ path: "/login", query: {redirect: "/tournaments"}});
    return;
  }

  try{
    const res = await api.post(`/tournaments/${id}/join`);
    alert(res.data.message);

    await load();

  } catch (err){
    console.error("Failed to join the tournament", err);

    if(err.response){
      alert(err.response.data.message || "Failed to join tournament");
    }
    else {
      alert("Server is not responding.");
    }
    
  }
};

const getProgress = (t) => {
  if(!t.maxPlayers || t.maxPlayers <= 0){
    return 0;
  }

  const progress = (t.players / t.maxPlayers) * 100;
  return Math.min(progress, 100);
}

onMounted(load);
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
  padding: 20px 0 30px;
}

.hero-content h1 {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
  color: #4BDE4B;
  text-shadow: 0 0 25px rgba(75,222,75,.25);
}

.hero-content p {
  opacity: .8;
  margin-top: 30px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-top: 40px;

  background: rgba(255,255,255,.04);
  backdrop-filter: blur(10px);
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
}

.filters input,
.filters select {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.05);
  color: white;
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

.tabs {
  display: flex;
  gap: 10px;
  margin: 25px 0;
}

.tabs button {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.03);
  color: white;
  cursor: pointer;
}

.tabs button.active {
  background: #4BDE4B;
  color: #0b0c10;
  font-weight: bold;
}

.leaderboard {
  margin-top: 20px;
}

.board {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
}

.row {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 1fr;
  padding: 14px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.row:hover {
  background: rgba(75,222,75,.06);
}

.head {
  opacity: .6;
  font-size: 12px;
  text-transform: uppercase;
  background: rgba(255,255,255,.03);
}

.pos {
  color: #4BDE4B;
  font-weight: bold;
}

.player {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4BDE4B, #1f6b1f);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.podium {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.pod {
  padding: 15px;
  border-radius: 12px;
  background: rgba(255,255,255,.05);
}

.gold { border: 1px solid gold; }
.silver { border: 1px solid silver; }
.bronze { border: 1px solid #cd7f32; }

.win {
  color: #4BDE4B;
  font-weight: 600;
}

</style>
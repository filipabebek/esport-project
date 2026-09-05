<template>
  <div class="games-page">

    <section class="hero-banner">
      <div class="hero-content">
        <h1>Explore Games</h1>
        <p>Discover competitive titles, tournaments and communities.</p>
        <div class="search-box">
          <input v-model="search" placeholder="Search games..."/>
        </div>
      </div>
    </section>

    <section class="grid">
      <div v-for="game in filteredGames" :key="game._id" class="card">
        <div class="card-image">
          <img :src="game.image" :alt="game.name"/>
        </div>

        <div class="card-content">
          <h3>{{ game.name }}</h3>
          <p class="desc">{{ game.description }}</p>

          <div class="meta">
            <span class="tag">Competitive</span>
          </div>

          <button class="btn" @click="viewTournaments(game.name)">View Tournaments</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const search = ref("");
const router = useRouter();

const games = ref([]);

const loadGames = async () => {
  try {
    const res = await api.get("/games");
    games.value = res.data;
  } catch (err) {
    console.error("Failed to load games:", err);
  }
};

const filteredGames = computed(() => {
  return games.value.filter(game =>
    game.name
      .toLowerCase()
      .includes(search.value.toLowerCase())
  );
});

const viewTournaments = (gameName) => {
  router.push({
    path: "/tournaments",
    query: {
      game: gameName
    }
  });
};
onMounted(loadGames);
</script>

<style scoped>
.games-page {
  min-height: 100vh;
  padding: 100px 50px;
  background: #0b0c10;
  color: white;
}

.hero-banner {
  height: 450px;
  background:
    linear-gradient(
      rgba(0,0,0,.55),
      rgba(0,0,0,.8)
    ),
    url("/games/banner.png");

  background-size: cover;
  background-position: center;
  border-radius: 24px;
  display: flex;
  align-items: center;
  margin-bottom: 60px;
}

.hero-content {
  padding-left: 70px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-content h1, .hero-content p{
    margin: 0;
  }

.hero-content h1 {
  font-size: 72px;
  font-weight: 800;
  margin-bottom: 10px;
}

.hero-content p {
  font-size: 18px;
  opacity: .8;
  margin-top: 10px;
  margin-right: 25px;
}

.search-box input {
  width: 320px;
  padding: 14px 18px;
  margin-right: 180px;
  border-radius: 12px;
  border: 1px solid rgba(75,222,75,.2);
  background: rgba(255,255,255,.05);
  color: white;
  outline: none;
  transition: .3s;
}

.search-box input:focus {
  border-color: #4BDE4B;
  box-shadow: 0 0 25px rgba(75,222,75,.2);
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
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.06);
  transition: .3s ease;
}

.card:hover {
  transform: translateY(-8px);
  border-color: rgba(75,222,75,.3);
  box-shadow: 0 15px 35px rgba(0,0,0,.5), 0 0 25px rgba(75,222,75,.15);
}

.card-image {
  height: 220px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: .4s;
}

.card:hover .card-image img {
  transform: scale(1.08);
}

.card-content {
  padding: 22px;
}

.card-content h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.desc {
  opacity: .75;
  line-height: 1.6;
  margin-bottom: 15px;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 13px;
}

.tag {
  color: #4BDE4B;
  font-weight: 600;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: rgba(75,222,75,.15);
  color: #4BDE4B;
  font-weight: 600;
  cursor: pointer;
  transition: .25s;
}

.btn:hover {
  background: #4BDE4B;
  color: #0b0c10;
}

@media (max-width: 768px) {

  .games-page {
    padding: 80px 20px;
  }

  .hero-banner {
    height: 350px;
  }

  .hero-content {
    padding: 30px;
  }

  .hero-content h1 {
    font-size: 42px;
  }

  .search-box input {
    width: 100%;
  }

}
</style>
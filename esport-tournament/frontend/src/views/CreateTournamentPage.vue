<template>
  <div class="create-page">
    <div class="bg-blur"></div>
    <div class="bg-blur-second"></div>

    <main class="create-container">
      <section class="page-header">
        <p class="tag">Organizer</p>
        <h1>Create <span>tournament</span></h1>
        <p class="subtitle">Set up a new competition and publish it for players.</p>
      </section>

      <form class="create-grid" @submit.prevent="createTournament">
        <div class="form-card">
          <div class="section-header">
            <div>
              <h3>Tournament details</h3>
              <p>Basic information about your competition.</p>
            </div>
            <i class="mdi mdi-trophy-outline header-icon"></i>
          </div>

          <div class="form-group">
            <label for="name">Tournament name</label>
            <div class="input-wrapper">
              <i class="mdi mdi-trophy-outline"></i>
              <input
                id="name"
                v-model.trim="form.name"
                type="text"
                placeholder="e.g. Valorant Champions Cup"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="game">Game</label>
              <div class="input-wrapper">
                <i class="mdi mdi-controller-classic-outline"></i>
                <select id="game" v-model="form.game" required>
                  <option value="" disabled>Select game</option>
                  <option v-for="game in games" :key="game._id" :value="game._id">{{ game.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="region">Region</label>
              <div class="input-wrapper">
                <i class="mdi mdi-earth"></i>
                <select id="region" v-model="form.region" required>
                  <option value="" disabled>Select region</option>
                  <option value="EU">Europe</option>
                  <option value="NA">North America</option>
                  <option value="SA">South America</option>
                  <option value="ASIA">Asia</option>
                  <option value="OCE">Oceania</option>
                  <option value="Global">Global</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model.trim="form.description"
              rows="5"
              placeholder="Describe the tournament, format, rules or important information..."
              required
            ></textarea>

            <div class="character-count">{{ form.description.length }}/500</div>
          </div>
        </div>

        <div class="form-card">
          <div class="section-header">
            <div>
              <h3>Competition settings</h3>
              <p>Configure capacity, prize and starting date.</p>
            </div>
            <i class="mdi mdi-cog-outline header-icon"></i>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="maxPlayers">Maximum players</label>
              <div class="input-wrapper">
                <i class="mdi mdi-account-group-outline"></i>
                <input
                  id="maxPlayers"
                  v-model.number="form.maxPlayers"
                  type="number"
                  min="2"
                  placeholder="32"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="prize">Prize</label>
              <div class="input-wrapper">
                <i class="mdi mdi-cash"></i>
                <input
                  id="prize"
                  v-model.trim="form.prize"
                  type="text"
                  placeholder="$5000"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="date">Tournament date</label>
            <div class="input-wrapper">
              <i class="mdi mdi-calendar-outline"></i>
              <input
                id="date"
                v-model="form.date"
                type="datetime-local"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Status</label>

            <div class="status-options">
              <button
                type="button"
                class="status-option"
                :class="{ selected: form.status === 'UPCOMING' }"
                @click="form.status = 'UPCOMING'"
              >
                <span class="status-dot upcoming"></span>

                <div>
                  <strong>Upcoming</strong>
                  <span>Tournament has not started yet.</span>
                </div>
              </button>

              <button
                type="button"
                class="status-option"
                :class="{ selected: form.status === 'LIVE' }"
                @click="form.status = 'LIVE'"
              >
                <span class="status-dot live"></span>

                <div>
                  <strong>Live</strong>
                  <span>Tournament is currently running.</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <aside class="preview-card">
          <div class="section-header">
            <div>
              <h3>Preview</h3>
              <p>How your tournament will appear.</p>
            </div>
            <i class="mdi mdi-eye-outline header-icon"></i>
          </div>

          <div class="preview">
            <div class="preview-top">
              <span class="status-badge" :class="form.status.toLowerCase()">
                <span v-if="form.status === 'LIVE'" class="live-dot"></span>{{ form.status }}</span>

              <span class="game-badge">{{ selectedGame?.name || "Game" }}</span>
            </div>

            <h2>{{ form.name || "Tournament name" }}</h2>

            <p>{{form.description || "Your tournament description will appear here."}}</p>

            <div class="preview-meta">
              <span>
                <i class="mdi mdi-cash"></i>{{ form.prize || "No prize" }}
              </span>

              <span>
                <i class="mdi mdi-account-group-outline"></i>
                0/{{ form.maxPlayers || 0 }}
              </span>

              <span>
                <i class="mdi mdi-calendar-outline"></i>{{ previewDate }}
              </span>

              <span>
                <i class="mdi mdi-earth"></i>{{ form.region || "Region" }}
              </span>
            </div>
          </div>

          <div v-if="error" class="message error-message">
            <i class="mdi mdi-alert-circle-outline"></i>{{ error }}
          </div>

          <div v-if="success" class="message success-message">
            <i class="mdi mdi-check-circle-outline"></i>Tournament created successfully.
          </div>

          <div class="form-actions">
            <router-link to="/dashboard" class="cancel-btn">Cancel
            </router-link>

            <button class="submit-btn" type="submit" :disabled="loading">
              <i :class="[ 'mdi', loading ? 'mdi-loading mdi-spin' : 'mdi-plus-circle-outline']"></i>{{ loading ? "Creating..." : "Create tournament" }}
            </button>
          </div>
        </aside>
      </form>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted} from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

const loading = ref(false);
const error = ref("");
const success = ref(false);
const games = ref([]);

const form = reactive({
  name: "",
  game: "",
  description: "",
  maxPlayers: 32,
  prize: "",
  date: "",
  region: "EU",
  status: "UPCOMING",
});

const selectedGame = computed(() => {
  return games.value.find(game => game._id === form.game);
});

const previewDate = computed(() => {
  if (!form.date) return "Date";

  const date = new Date(form.date);

  if (Number.isNaN(date.getTime())) {
    return form.date;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
});

const createTournament = async () => {
  error.value = "";
  success.value = false;

  if (
    !form.name ||
    !form.game ||
    !form.description ||
    !form.maxPlayers ||
    !form.date ||
    !form.region
  ) {
    error.value = "Please fill in all required fields.";
    return;
  }

  if (form.description.length > 500) {
    error.value ="Description cannot be longer than 500 characters.";
    return;
  }

  if (form.maxPlayers < 2) {
    error.value ="Tournament must allow at least 2 players.";
    return;
  }

  try {
    loading.value = true;

    await api.post("/tournaments", {
      name: form.name,
      game: form.game,
      description: form.description,
      maxPlayers: form.maxPlayers,
      prize: form.prize || "0",
      date: form.date,
      region: form.region,
      status: form.status,
    });

    success.value = true;

    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  } catch (err) {
    console.error("Failed to create tournament:", err);

    error.value =
      err.response?.data?.message || "Failed to create tournament.";
  } finally {
    loading.value = false;
  }
};

const loadGames = async () => {
  try {
    const res = await api.get("/games");
    games.value = res.data;
  } catch (err) {
    console.error("Failed to load games:", err);
    error.value = "Failed to load games.";
  }
};

onMounted(loadGames);
</script>

<style scoped>
.create-page {
  position: relative;
  min-height: 100vh;
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
  top: 70px;
  right: -130px;
}

.bg-blur-second {
  bottom: -160px;
  left: -150px;
}

.create-container {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 120px 0 60px;
}

.page-header {
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
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.08;
}

.page-header h1 span {
  color: #4bde4b;
}

.subtitle {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 13px;
}

.create-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.form-card,
.preview-card {
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(16px);
}

.preview-card {
  grid-column: 1 / -1;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.section-header h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: 10px;
}

.header-icon {
  color: #4bde4b;
  font-size: 20px;
}

.form-group {
  position: relative;
  margin-bottom: 18px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper > i {
  position: absolute;
  top: 50%;
  left: 13px;
  z-index: 1;
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
  transform: translateY(-50%);
  pointer-events: none;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.07);
  outline: none;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.025);
  color: #fff;
  font-family: inherit;
  transition: 0.2s ease;
}

input,
select {
  height: 45px;
  padding: 0 13px 0 39px;
}

textarea {
  min-height: 125px;
  padding: 13px;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: rgba(75, 222, 75, 0.45);
  background: rgba(75, 222, 75, 0.02);
  box-shadow: 0 0 0 3px rgba(75, 222, 75, 0.04);
}

input::placeholder,
textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

select {
  appearance: none;
  cursor: pointer;
}

select option {
  background: #101315;
  color: #fff;
}

.character-count {
  position: absolute;
  right: 8px;
  bottom: -14px;
  color: rgba(255, 255, 255, 0.24);
  font-size: 9px;
}

.status-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.02);
  color: #fff;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.status-option:hover,
.status-option.selected {
  border-color: rgba(75, 222, 75, 0.3);
  background: rgba(75, 222, 75, 0.04);
}

.status-option > div {
  display: flex;
  flex-direction: column;
}

.status-option strong {
  font-size: 11px;
}

.status-option span:last-child {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.32);
  font-size: 9px;
}

.status-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.status-dot.upcoming {
  background: #4bde4b;
}

.status-dot.live {
  background: #ff6262;
}

.preview {
  padding: 19px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.15);
}

.preview-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-badge,
.game-badge {
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.status-badge.upcoming {
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.08);
}

.status-badge.live {
  color: #ff6262;
  background: rgba(255, 98, 98, 0.08);
}

.game-badge {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.04);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.preview h2 {
  margin: 17px 0 7px;
  font-size: 20px;
}

.preview > p {
  max-width: 700px;
  margin: 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  line-height: 1.6;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 17px;
  margin-top: 17px;
}

.preview-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 10px;
}

.preview-meta i {
  color: #4bde4b;
}

.message {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 10px;
}

.error-message {
  color: #ff7777;
  background: rgba(255, 90, 90, 0.06);
  border: 1px solid rgba(255, 90, 90, 0.12);
}

.success-message {
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.06);
  border: 1px solid rgba(75, 222, 75, 0.12);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.cancel-btn,
.submit-btn {
  min-height: 41px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 16px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.cancel-btn {
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.025);
}

.submit-btn {
  border: 0;
  color: #071007;
  background: #4bde4b;
  cursor: pointer;
  transition: 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(75, 222, 75, 0.14);
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 850px) {
  .create-grid,
  .form-row {
    grid-template-columns: 1fr;
  }

  .preview-card {
    grid-column: auto;
  }
}

@media (max-width: 600px) {
  .create-container {
    width: min(100% - 24px, 1180px);
    padding-top: 100px;
  }

  .form-card,
  .preview-card {
    padding: 17px;
  }

  .status-options {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
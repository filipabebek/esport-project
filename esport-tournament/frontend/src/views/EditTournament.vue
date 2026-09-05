<template>
  <div class="edit-page">
    <div class="edit-wrapper">
      <button class="back-btn" @click="router.back()">
        <i class="mdi mdi-arrow-left"></i>Back
      </button>

      <div class="page-header">
        <div>
          <span class="eyebrow">ORGANIZER AREA</span>
          <h1>Edit Tournament</h1>
          <p>Update tournament details and save your changes.</p>
        </div>

        <div class="header-icon">
          <i class="mdi mdi-trophy-outline"></i>
        </div>
      </div>

      <div v-if="loading" class="state-card">
        <i class="mdi mdi-loading mdi-spin"></i>
        <span>Loading tournament...</span>
      </div>

      <form v-else class="edit-card" @submit.prevent="saveTournament">
        <div class="section-title">
          <div>
            <span>TOURNAMENT DETAILS</span>
            <h2>Basic information</h2>
          </div>
          <i class="mdi mdi-information-outline"></i>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>Tournament name</label>
            <div class="input-wrap">
              <i class="mdi mdi-trophy-outline"></i>
              <input v-model="form.name" type="text" placeholder="Tournament name" required />
            </div>
          </div>

          <div class="field">
            <label>Game</label>
            <div class="input-wrap">
              <i class="mdi mdi-gamepad-variant-outline"></i>
              <select v-model="form.game" required>
                <option value="" disabled>Select game</option>
                <option v-for="game in games" :key="game._id" :value="game._id">{{ game.name }}</option>
              </select>
            </div>
          </div>

          <div class="field full">
            <label>Description</label>
            <textarea v-model="form.description" rows="5" placeholder="Describe the tournament..." required></textarea>
          </div>

          <div class="field">
            <label>Maximum players</label>
            <div class="input-wrap">
              <i class="mdi mdi-account-group-outline"></i>
              <input v-model.number="form.maxPlayers" type="number" min="2" required />
            </div>
          </div>

          <div class="field">
            <label>Prize</label>
            <div class="input-wrap">
              <i class="mdi mdi-cash"></i>
              <input v-model="form.prize" type="text" placeholder="e.g. €500" />
            </div>
          </div>

          <div class="field">
            <label>Date and time</label>
            <div class="input-wrap">
              <i class="mdi mdi-calendar-outline"></i>
              <input v-model="form.date" type="datetime-local" required />
            </div>
          </div>

          <div class="field">
            <label>Region</label>
            <div class="input-wrap">
              <i class="mdi mdi-earth"></i>
              <select v-model="form.region">
                <option value="EU">Europe</option>
                <option value="NA">North America</option>
                <option value="Asia">Asia</option>
                <option value="Global">Global</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Status</label>
            <div class="input-wrap">
              <i class="mdi mdi-circle-slice-8"></i>
              <select v-model="form.status">
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="cancel-btn" @click="router.back()">Cancel</button>

          <button type="submit" class="save-btn" :disabled="saving">
            <i class="mdi" :class="saving ? 'mdi-loading mdi-spin' : 'mdi-content-save-outline'"></i>
            {{ saving ? "Saving..." : "Save changes" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const games = ref([]);

const form = reactive({
  name: "",
  game: "",
  description: "",
  maxPlayers: 2,
  prize: "",
  date: "",
  region: "Global",
  status: "UPCOMING"
});

const loadGames = async () => {
  try {
    const res = await api.get("/games");
    games.value = res.data;
  } catch (err) {
    console.error("Failed to load games:", err);
  }
};

const loadTournament = async () => {
  try {
    const res = await api.get(`/tournaments/${route.params.id}`);
    const tournament = res.data;

    form.name = tournament.name;
    form.game = tournament.game?._id || tournament.game;
    form.description = tournament.description;
    form.maxPlayers = tournament.maxPlayers;
    form.prize = tournament.prize;
    form.region = tournament.region;
    form.status = tournament.status;

    if (tournament.date) {
      form.date = new Date(tournament.date).toISOString().slice(0, 16);
    }
  } catch (err) {
    console.error("Failed to load tournament:", err);
    alert("Failed to load tournament");
    router.push("/tournaments");
  } finally {
    loading.value = false;
  }
};

const saveTournament = async () => {
  saving.value = true;

  try {
    const res = await api.put(`/tournaments/${route.params.id}`, form);

    alert(res.data.message || "Tournament updated successfully");
    router.push(`/tournaments/${route.params.id}`);
  } catch (err) {
    console.error("Failed to update tournament:", err);

    alert(
      err.response?.data?.message ||
      "Failed to update tournament"
    );
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
    await Promise.all([
        loadGames(),
        loadTournament()
    ]);
});
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  padding: 105px 24px 60px;
  background:
    radial-gradient(circle at 15% 10%, rgba(75,222,75,.08), transparent 35%),
    radial-gradient(circle at 85% 25%, rgba(0,150,255,.04), transparent 40%),
    #0b0c10;
  color: white;
}

.edit-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 24px;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: rgba(255,255,255,.55);
  font-family: inherit;
  font-size: 16px;
  cursor: pointer;
  transition: .2s ease;
}

.back-btn:hover {
  color: #4BDE4B;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #4BDE4B;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 46px);
  line-height: 1;
  letter-spacing: -1px;
}

.page-header p {
  margin: 10px 0 0;
  color: rgba(255,255,255,.5);
  font-size: 13px;
}

.header-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(75,222,75,.18);
  border-radius: 16px;
  background: rgba(75,222,75,.06);
  color: #4BDE4B;
  font-size: 27px;
}

.edit-card {
  padding: 26px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 20px;
  background: rgba(18,20,27,.9);
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.section-title span {
  color: #4BDE4B;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.section-title h2 {
  margin: 4px 0 0;
  font-size: 18px;
}

.section-title > i {
  color: rgba(255,255,255,.25);
  font-size: 21px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  color: rgba(255,255,255,.65);
  font-size: 14px;
  font-weight: 500;
}

.input-wrap {
  position: relative;
}

.input-wrap > i {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,.28);
  font-size: 16px;
  pointer-events: none;
}

.input-wrap input,
.input-wrap select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 11px;
  background: rgba(255,255,255,.035);
  color: white;
  font-family: inherit;
  font-size: 15px;
  outline: none;
  transition: .2s ease;
}

.input-wrap input,
.input-wrap select {
  height: 44px;
  padding: 0 12px 0 39px;
}

.field textarea {
  min-height: 115px;
  padding: 13px;
  resize: vertical;
}

.input-wrap input:focus,
.input-wrap select:focus,
.field textarea:focus {
  border-color: rgba(75,222,75,.45);
  background: rgba(75,222,75,.025);
  box-shadow: 0 0 0 3px rgba(75,222,75,.04);
}

.input-wrap select option {
  background: #12141b;
  color: white;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 22px;
  margin-top: 24px;
  border-top: 1px solid rgba(255,255,255,.06);
}

.cancel-btn,
.save-btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s ease;
}

.cancel-btn {
  border: 1px solid rgba(255,255,255,.09);
  background: rgba(255,255,255,.03);
  color: rgba(255,255,255,.7);
}

.cancel-btn:hover {
  border-color: rgba(255,255,255,.18);
  background: rgba(255,255,255,.06);
  color: white;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 135px;
  border: 1px solid #4BDE4B;
  background: #4BDE4B;
  color: #0b0c10;
}

.save-btn:hover:not(:disabled) {
  box-shadow: 0 0 18px rgba(75,222,75,.2);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 160px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 20px;
  background: #12141b;
  color: rgba(255,255,255,.55);
  font-size: 14px;
}

@media (max-width: 700px) {
  .edit-page {
    padding: 90px 16px 40px;
  }

  .header-icon {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field.full {
    grid-column: auto;
  }

  .edit-card {
    padding: 20px;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
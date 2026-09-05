<template>
  <div class="details-page">
    <section v-if="loading" class="state-card">
      <i class="mdi mdi-loading mdi-spin"></i>
      <p>Loading tournament...</p>
    </section>

    <section v-else-if="error" class="state-card error">
      <i class="mdi mdi-alert-circle-outline"></i>
      <p>{{ error }}</p>
    </section>

    <template v-else-if="tournament">
      <section class="hero">
        <div class="hero-content">
          <router-link to="/tournaments" class="back-link"><i class="mdi mdi-arrow-left"></i>Back to tournaments</router-link>

          <div class="hero-top">
            <div>
              <div class="badges">
                <span class="status" :class="statusClass(tournament.status)">
                  <span v-if="tournament.status === 'LIVE'" class="live-dot"></span>
                  {{ tournament.status }}
                </span>
                <span class="game">{{ tournament.game?.name || "Unknown game" }}</span>
              </div>

              <h1>{{ tournament.name }}</h1>
              <p>{{ tournament.description }}</p>
            </div>

            <button v-if="auth.role === 'player' && !isJoined && tournament.status !== 'ENDED'" class="join-btn" @click="applyToTournament">
              <i class="mdi mdi-login-variant"></i>Apply to Tournament
            </button>

            <div v-else-if="auth.role === 'player' && isJoined" class="joined-badge">
              <i class="mdi mdi-check-circle-outline"></i>Joined
            </div>
          </div>
        </div>
      </section>

      <main class="content">
        <section class="info-grid">
          <div class="info-card">
            <div class="info-icon"><i class="mdi mdi-calendar-outline"></i></div>
            <div><span>Date</span><strong>{{ formatDate(tournament.date) }}</strong></div>
          </div>

          <div class="info-card">
            <div class="info-icon"><i class="mdi mdi-earth"></i></div>
            <div><span>Region</span><strong>{{ tournament.region || "Global" }}</strong></div>
          </div>

          <div class="info-card">
            <div class="info-icon"><i class="mdi mdi-cash"></i></div>
            <div><span>Prize</span><strong>{{ tournament.prize || "0" }}</strong></div>
          </div>

          <div class="info-card">
            <div class="info-icon"><i class="mdi mdi-account-group-outline"></i></div>
            <div><span>Participants</span><strong>{{ participants.length }} / {{ tournament.maxPlayers }}</strong></div>
          </div>
        </section>

        <section class="details-grid">
          <div class="main-column">
            <div class="card">
              <div class="section-header">
                <div>
                  <span class="section-label">TOURNAMENT</span>
                  <h2>About this tournament</h2>
                </div>
              </div>

              <p class="about-text">{{ tournament.description || "No description available." }}</p>

              <div v-if="tournament.status === 'UPCOMING'" class="countdown">
                <div class="countdown-icon"><i class="mdi mdi-clock-outline"></i></div>
                <div>
                  <span>Starts in</span>
                  <strong>{{ getTimeLeft(tournament.date) }}</strong>
                </div>
              </div>
            </div>
            
            <div v-if="isOwner || auth.role === 'admin'" class="card applications-card">
              <div class="section-header">
                <div>
                  <span class="section-label">APPLICATIONS</span>
                  <h2>Pending applications</h2>
                </div>

                <span class="participant-count">
                  {{ enrollments.filter(e => e.status === "pending").length }}
                </span>
              </div>

              <div v-if="enrollmentsLoading" class="participants-state">
                <i class="mdi mdi-loading mdi-spin"></i>Loading applications...
              </div>

              <div
                v-else-if="!enrollments.some(e => e.status === 'pending')"
                class="empty-participants"
              >
                <div class="empty-icon">
                  <i class="mdi mdi-account-clock-outline"></i>
                </div>
                <h3>No pending applications</h3>
                <p>There are currently no players waiting for approval.</p>
              </div>

              <div v-else class="applications-list">
                <div v-for="enrollment in enrollments.filter(e => e.status === 'pending')" :key="enrollment._id" class="application-row">
                  <div class="avatar">
                    {{ initial(enrollment.user?.username) }}
                  </div>

                  <div class="application-user">
                    <strong>{{ enrollment.user?.username || "Unknown player" }}</strong>
                    <span>{{ enrollment.user?.email }}</span>
                  </div>

                  <div class="application-actions">
                    <button class="approve-btn" @click="approveEnrollment(enrollment)">
                      <i class="mdi mdi-check"></i>Approve
                    </button>

                    <button class="reject-btn" @click="rejectEnrollment(enrollment)">
                      <i class="mdi mdi-close"></i>Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="card participants-card">
              <div class="section-header">
                <div>
                  <span class="section-label">PLAYERS</span>
                  <h2>Participants</h2>
                </div>
                <span class="participant-count">{{ participants.length }} / {{ tournament.maxPlayers }}</span>
              </div>

              <div v-if="participantsLoading" class="participants-state">
                <i class="mdi mdi-loading mdi-spin"></i>Loading participants...
              </div>

              <div v-else-if="participants.length === 0" class="empty-participants">
                <div class="empty-icon"><i class="mdi mdi-account-group-outline"></i></div>
                <h3>No participants yet</h3>
                <p>Be the first player to join this tournament.</p>
              </div>

              <div v-else class="participants-list">
                <div v-for="(participant, index) in participants" :key="participant._id" class="participant-row">
                    <div class="participant-number">{{ index + 1 }}</div>

                    <div class="avatar">{{ initial(participant.user?.username) }}</div>

                    <div class="participant-user">
                    <strong>{{ participant.user?.username || "Unknown player" }}</strong>
                    <span>Joined {{ formatDate(participant.createdAt) }}</span>
                    </div>

                    <span class="participation-status" :class="participant.status">{{ formatParticipationStatus(participant.status) }}</span>

                    <div v-if="participant.placement" class="placement">
                    <i class="mdi mdi-medal-outline"></i>{{ formatPlacement(participant.placement) }}
                    </div>

                    <button v-if="isOwner" class="remove-btn" @click="removeParticipant(participant)">
                    <i class="mdi mdi-account-remove-outline"></i>Remove
                    </button>
                </div>
            </div>
            </div>
          </div>

          <aside class="side-column">
            <div class="card summary-card">
              <span class="section-label">DETAILS</span>
              <h2>Tournament info</h2>

              <div class="summary-list">
                <div class="summary-row"><span><i class="mdi mdi-controller-classic-outline"></i>Game</span><strong>{{ tournament.game?.name || "Unknown game" }}</strong></div>
                <div class="summary-row"><span><i class="mdi mdi-earth"></i>Region</span><strong>{{ tournament.region || "Global" }}</strong></div>
                <div class="summary-row"><span><i class="mdi mdi-account-group-outline"></i>Capacity</span><strong>{{ participants.length }}/{{ tournament.maxPlayers }}</strong></div>
                <div class="summary-row"><span><i class="mdi mdi-cash"></i>Prize pool</span><strong>{{ tournament.prize || "0" }}</strong></div>
                <div class="summary-row"><span><i class="mdi mdi-calendar-outline"></i>Date</span><strong>{{ formatDate(tournament.date) }}</strong></div>
              </div>

              <div class="capacity">
                <div class="capacity-top"><span>Capacity</span><strong>{{ capacityPercent }}%</strong></div>
                <div class="progress"><div class="progress-bar" :style="{ width: capacityPercent + '%' }"></div></div>
              </div>
            </div>

            <div v-if="tournament.organizer" class="card organizer-card">
              <span class="section-label">HOST</span>
              <h2>Organizer</h2>

              <div class="organizer">
                <div class="organizer-avatar">{{ initial(tournament.organizer.username) }}</div>
                <div>
                  <strong>{{ tournament.organizer.username }}</strong>
                  <span>Tournament organizer</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { useAuthStore } from "../store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const tournament = ref(null);
const participants = ref([]);
const loading = ref(true);
const participantsLoading = ref(true);
const error = ref("");

const enrollments = ref([]);
const enrollmentsLoading = ref(false);

const loadEnrollments = async () => {
  if (!isOwner.value && auth.role !== "admin") return;

  try {
    enrollmentsLoading.value = true;

    const res = await api.get(
      `/enrollments/tournaments/${route.params.id}`
    );

    enrollments.value = res.data;
  } catch (err) {
    console.error("Failed to load applications:", err);
  } finally {
    enrollmentsLoading.value = false;
  }
};

const approveEnrollment = async enrollment => {
  try {
    const res = await api.put(
      `/enrollments/${enrollment._id}/approve`
    );

    alert(res.data.message);

    await Promise.all([
      loadEnrollments(),
      loadParticipants(),
      loadTournament()
    ]);
  } catch (err) {
    console.error("Failed to approve application:", err);

    alert(
      err.response?.data?.message ||
      "Failed to approve application"
    );
  }
};

const rejectEnrollment = async enrollment => {
  try {
    const res = await api.put(
      `/enrollments/${enrollment._id}/reject`
    );

    alert(res.data.message);

    await loadEnrollments();
  } catch (err) {
    console.error("Failed to reject application:", err);

    alert(
      err.response?.data?.message ||
      "Failed to reject application"
    );
  }
};

const loadTournament = async () => {
  try {
    const res = await api.get(`/tournaments/${route.params.id}`);
    tournament.value = res.data;
  } catch (err) {
    console.error("Failed to load tournament:", err);
    error.value = err.response?.data?.message || "Failed to load tournament.";
  }
};

const loadParticipants = async () => {
  try {
    participantsLoading.value = true;

    const res = await api.get(`/tournaments/${route.params.id}/participants`);
    participants.value = res.data;
  } catch (err) {
    console.error("Failed to load participants:", err);
  } finally {
    participantsLoading.value = false;
  }
};

const isOwner = computed(() => {
  if (!tournament.value || auth.role !== "organizer") return false;

  const currentUserId = auth.user?._id || auth.user?.id;
  const organizerId =
    tournament.value.organizer?._id ||
    tournament.value.organizer;

  return String(currentUserId) === String(organizerId);
});

const removeParticipant = async (participant) => {
  const username = participant.user?.username || "this participant";

  const confirmed = confirm(
    `Are you sure you want to remove ${username} from this tournament?`
  );

  if (!confirmed) return;

  try {
    const userId = participant.user?._id || participant.user;

    const res = await api.delete(
      `/tournaments/${route.params.id}/participants/${userId}`
    );

    alert(res.data.message);

    await Promise.all([
      loadTournament(),
      loadParticipants()
    ]);
  } catch (err) {
    console.error("Failed to remove participant:", err);

    alert(
      err.response?.data?.message ||
      "Failed to remove participant"
    );
  }
};

const applyToTournament = async () => {
  if (!auth.isAuthenticated) {
    router.push({
      path: "/login",
      query: { redirect: route.fullPath }
    });
    return;
  }

  try {
    const res = await api.post(
      `/enrollments/tournaments/${route.params.id}`
    );

    alert(res.data.message);
  } catch (err) {
    console.error("Failed to apply to tournament:", err);

    alert(
      err.response?.data?.message ||
      "Failed to apply to tournament"
    );
  }
};

const isJoined = computed(() => {
  if (!auth.user) return false;

  return participants.value.some(participant => {
    const userId = participant.user?._id || participant.user;
    return userId?.toString() === auth.user.id?.toString();
  });
});

const capacityPercent = computed(() => {
  if (!tournament.value?.maxPlayers) return 0;

  return Math.min(
    Math.round(
      (participants.value.length / tournament.value.maxPlayers) * 100
    ),
    100
  );
});

const formatDate = date => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
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

const formatParticipationStatus = status => {
  if (status === "registered") return "Registered";
  if (status === "playing") return "Playing";
  if (status === "finished") return "Finished";
  return status;
};

const formatPlacement = placement => {
  if (placement === 1) return "1st";
  if (placement === 2) return "2nd";
  if (placement === 3) return "3rd";
  return `${placement}th`;
};

const statusClass = status => String(status || "").toLowerCase();

const initial = username => username?.charAt(0).toUpperCase() || "?";

onMounted(async () => {
  loading.value = true;

  await loadTournament();
  await loadParticipants();

  if (isOwner.value || auth.role === "admin") {
    await loadEnrollments();
  }

  loading.value = false;
});
</script>

<style scoped>
.details-page {
  min-height: 100vh;
  background: #090b10;
  color: #fff;
}

.hero {
  padding: 120px 0 42px;
  background: radial-gradient(circle at 20% 20%, rgba(75, 222, 75, 0.08), transparent 34%);
}

.hero-content,
.content {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 27px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
  text-decoration: none;
  transition: 0.2s ease;
}

.back-link:hover {
  color: #4bde4b;
}

.hero-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
}

.badges {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
}

.status,
.game {
  padding: 5px 9px;
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
  background: rgba(75, 222, 75, 0.08);
}

.status.live {
  color: #ff6565;
  background: rgba(255, 101, 101, 0.08);
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
  color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.04);
}

.hero h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 52px);
}

.hero p {
  max-width: 650px;
  margin: 12px 0 0;
  margin-right: 70px;
  color: rgba(255, 255, 255, 0.38);
  font-size: 12px;
  line-height: 1.7;
}

.joined-badge {
  min-height: 43px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  border: 1px solid rgba(75, 222, 75, 0.15);
  border-radius: 8px;
  background: rgba(75, 222, 75, 0.07);
  color: #4bde4b;
  font-size: 14px;
  font-weight: 600;
}

.content {
  padding: 25px 0 60px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
  font-size: 16px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
}

.info-icon {
  width: 37px;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
}

.info-card > div:last-child {
  display: flex;
  flex-direction: column;
}

.info-card span {
  color: rgba(255, 255, 255, 0.28);
  font-size: 11px;
}

.info-card strong {
  margin-top: 3px;
  font-size: 13px;
}

.details-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(260px, 0.8fr);
  gap: 18px;
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card {
  padding: 21px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 13px;
  background: #111319;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.section-label {
  display: block;
  margin-bottom: 5px;
  color: #4bde4b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
}

.card h2 {
  margin: 0;
  font-size: 15px;
}

.about-text {
  margin: 15px 0 0;
  color: rgba(255, 255, 255, 0.38);
  font-size: 13px;
  line-height: 1.75;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(75, 222, 75, 0.04);
}

.countdown-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.08);
}

.countdown > div:last-child {
  display: flex;
  flex-direction: column;
}

.countdown span {
  color: rgba(255, 255, 255, 0.28);
  font-size: 10px;
}

.countdown strong {
  margin-top: 2px;
  font-size: 15px;
}

.participant-count {
  padding: 5px 8px;
  border-radius: 5px;
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
  font-size: 11px;
  font-weight: 600;
}

.participants-list {
  margin-top: 16px;
}

.participant-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.participant-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.participant-number {
  width: 20px;
  color: rgba(255, 255, 255, 0.22);
  font-size: 11px;
  text-align: center;
}

.avatar,
.organizer-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(75, 222, 75, 0.08);
  color: #4bde4b;
  font-weight: 700;
}

.avatar {
  width: 34px;
  height: 34px;
  font-size: 14px;
}

.participant-user {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.participant-user strong {
  font-size: 16px;
  font-weight: 500;
}

.participant-user span {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.25);
  font-size: 11px;
}

.participation-status {
  padding: 4px 7px;
  border-radius: 5px;
  font-size: 12px;
  text-transform: capitalize;
}

.participation-status.registered {
  color: #4bde4b;
  background: rgba(75, 222, 75, 0.07);
}

.participation-status.playing {
  color: #66aaff;
  background: rgba(102, 170, 255, 0.07);
}

.participation-status.finished {
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.placement {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4bde4b;
  font-size: 9px;
}

.summary-card h2,
.organizer-card h2 {
  margin-bottom: 17px;
}

.summary-list {
  display: flex;
  flex-direction: column;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-row span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 15px;
}

.summary-row span i {
  color: #4bde4b;
  font-size: 13px;
}

.summary-row strong {
  font-size: 13px;
  font-weight: 500;
}

.capacity {
  margin-top: 18px;
}

.capacity-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  font-size: 12px;
}

.capacity-top span {
  color: rgba(255, 255, 255, 0.3);
}

.progress {
  height: 5px;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: #4bde4b;
}

.organizer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.organizer-avatar {
  width: 38px;
  height: 38px;
  font-size: 20px;
}

.organizer > div:last-child {
  display: flex;
  flex-direction: column;
}

.organizer strong {
  font-size: 16px;
}

.organizer span {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.27);
  font-size: 10px;
}

.participants-state,
.empty-participants {
  margin-top: 16px;
  padding: 30px 15px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  text-align: center;
}

.participants-state i {
  margin-right: 5px;
  color: #4bde4b;
}

.empty-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  border-radius: 9px;
  background: rgba(75, 222, 75, 0.07);
  color: #4bde4b;
}

.empty-participants h3 {
  margin: 0;
  color: #fff;
  font-size: 12px;
}

.empty-participants p {
  margin: 5px 0 0;
  font-size: 12px;
}

.state-card {
  width: min(600px, calc(100% - 40px));
  margin: 150px auto;
  padding: 50px 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 13px;
  background: #111319;
  text-align: center;
}

.state-card i {
  color: #4bde4b;
  font-size: 24px;
}

.state-card p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
}

.state-card.error i,
.state-card.error p {
  color: #ff6b6b;
}

@media (max-width: 900px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .hero-content,
  .content {
    width: calc(100% - 24px);
  }

  .hero {
    padding-top: 100px;
  }

  .hero-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .participant-row {
    flex-wrap: wrap;
  }
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid rgba(255, 77, 77, .2);
  border-radius: 8px;
  background: rgba(255, 77, 77, .07);
  color: #ff6767;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: .2s ease;
    margin-left: auto;
}

.remove-btn:hover {
  background: #ff4d4d;
  color: white;
}

.applications-list {
  margin-top: 16px;
}

.application-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.application-row:last-child {
  border-bottom: 0;
}

.application-user {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.application-user strong {
  font-size: 14px;
  font-weight: 500;
}

.application-user span {
  margin-top: 2px;
  color: rgba(255,255,255,.3);
  font-size: 11px;
}

.application-actions {
  display: flex;
  gap: 7px;
}

.approve-btn,
.reject-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 11px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: .2s ease;
}

.approve-btn {
  border: 1px solid rgba(75,222,75,.2);
  background: rgba(75,222,75,.07);
  color: #4bde4b;
}

.approve-btn:hover {
  background: #4bde4b;
  color: #090b10;
}

.reject-btn {
  border: 1px solid rgba(255,77,77,.2);
  background: rgba(255,77,77,.07);
  color: #ff6767;
}

.reject-btn:hover {
  background: #ff4d4d;
  color: white;
}
</style>
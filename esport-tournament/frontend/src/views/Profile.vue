<template>
  <div class="profile-page">

    <div class="bg-blur"></div>
    <div class="bg-blur-second"></div>

    <main class="profile-container">
      <div
        v-if="loading"
        class="profile-loading"
      >
        <i class="mdi mdi-loading mdi-spin"></i>
        <span>Loading profile...</span>
      </div>

      <div
        v-else-if="error"
        class="profile-error"
      >
        {{ error }}
      </div>

      <template v-else-if="profile">
        <section class="page-header">
          <p class="tag">Player Profile</p>
          <h1>Your <span>gaming profile</span></h1>

          <p class="subtitle">Track your competitive progress, tournament history and account details.</p>
        </section>

        <section class="profile-banner">
          <div class="profile-main">
            <div class="avatar">{{ userInitial }}<span class="online-dot"></span>
            </div>

            <div class="profile-details">
              <div class="name-row">
                <h2>{{ profile.user?.username || "User" }}</h2>
                <span class="role-badge">{{ formattedRole }}</span>
              </div>

              <p class="profile-description">Competitive player on eSports Tournament.</p>

              <div class="profile-meta">
                <span><i class="mdi mdi-email-outline"></i>{{ profile.user?.email || "No email" }}</span>
                <span><i class="mdi mdi-shield-account-outline"></i>{{ formattedRole }}</span>
                <span><i class="mdi mdi-check-decagram-outline"></i>{{ profile.user?.status || "Active" }}</span>
              </div>
            </div>
          </div>

          <button class="edit-btn">
            <i class="mdi mdi-pencil-outline"></i>Edit profile
          </button>
        </section>

        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-trophy-outline"></i>
            </div>

            <div>
              <strong>{{ profile.stats?.tournaments ?? 0 }}</strong>
              <span>Tournaments</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-crown-outline"></i>
            </div>
            <div>
              <strong>{{ profile.stats?.wins ?? 0 }}</strong>
              <span>Wins</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-chart-line"></i>
            </div>
            <div>
              <strong>{{ profile.stats?.winRate ?? 0 }}%</strong>
              <span>Win rate</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="mdi mdi-medal-outline"></i>
            </div>
            <div>
              <strong>
                {{
                  profile.stats?.globalRank
                    ? "#" + profile.stats.globalRank
                    : "—"
                }}
              </strong>
              <span>Global rank</span>
            </div>
          </div>
        </section>

        <section
            v-if="
                profile.user?.role === 'organizer' ||
                profile.user?.role === 'admin'
            "
            class="organizer-section"
            >
            <div class="section-header">
                <div>
                <h3>Organizer overview</h3>
                <p>Manage your tournaments and participants.</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                <div class="stat-icon">
                    <i class="mdi mdi-trophy-outline"></i>
                </div>
                <div>
                    <strong>{{ profile.organizerStats?.organizedTournaments ?? 0 }}</strong>
                    <span>Organized tournaments</span>
                </div>
                </div>

                <div class="stat-card">
                <div class="stat-icon">
                    <i class="mdi mdi-broadcast"></i>
                </div>
                <div>
                    <strong>{{ profile.organizerStats?.activeTournaments ?? 0 }}</strong>
                    <span>Active tournaments</span>
                </div>
                </div>

                <div class="stat-card">
                <div class="stat-icon">
                    <i class="mdi mdi-account-group-outline"></i>
                </div>

                <div>
                    <strong>{{ profile.organizerStats?.totalParticipants ?? 0 }}</strong>
                    <span>Total participants</span>
                </div>
                </div>
            </div>
        </section>

        <section class="dashboard-grid">
          <div class="dashboard-card tournaments-card">
            <div class="section-header">
              <div>
                <h3>Recent tournaments</h3>
                <p>Your latest competitive activity.</p>
              </div>
              <router-link to="/my-tournaments">View all<i class="mdi mdi-arrow-right"></i>
              </router-link>
            </div>

            <div
              v-if="profile.recentTournaments?.length"
              class="tournament-list"
            >

              <div
                v-for="tournament in profile.recentTournaments"
                :key="tournament.participationId"
                class="tournament-row"
              >

                <div class="tournament-icon"><i class="mdi mdi-gamepad-variant-outline"></i></div>
                <div class="tournament-info">
                  <strong>{{ tournament.name }}</strong>
                  <span>{{ tournament.game }}<span
                      v-if="tournament.region"
                      class="dot"
                    >
                      •
                    </span>{{ tournament.region }}</span>
                </div>

                <div
                  v-if="tournament.placement"
                  class="placement"
                  :class="{
                    winner: tournament.placement === 1,
                    second: tournament.placement === 2
                  }"
                >
                  #{{ tournament.placement }}
                </div>

                <div
                  v-else
                  class="tournament-status"
                >
                  {{ tournament.tournamentStatus }}
                </div>
              </div>
            </div>

            <div
              v-else
              class="empty-state"
            >

              <i class="mdi mdi-trophy-outline"></i>

              <p>You haven't joined any tournaments yet.</p>

              <router-link
                to="/tournaments"
                class="empty-link"
              >Browse tournaments</router-link>
            </div>
          </div>

          <div class="dashboard-card">
            <div class="section-header">
              <div>
                <h3>Favorite games</h3>
                <p>Your most played titles.</p>
              </div>
              <i class="mdi mdi-controller-classic-outline header-icon"></i>
            </div>

            <div
              v-if="profile.favoriteGames?.length"
              class="games-list"
            >

              <div
                v-for="game in profile.favoriteGames"
                :key="game.game"
                class="game-item"
              >

                <div class="game-icon"><i class="mdi mdi-controller-classic-outline"></i></div>
                <div>
                  <strong>{{ game.game }}</strong>
                  <span>{{ game.tournamentCount }}
                    {{
                      game.tournamentCount === 1
                        ? "tournament"
                        : "tournaments"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-else
              class="empty-state"
            >

              <i class="mdi mdi-controller-classic-outline"></i>
              <p>No games played yet.</p>
            </div>
          </div>
        </section>

        <section class="dashboard-grid bottom-grid">
          <div class="dashboard-card">
            <div class="section-header">
              <div>
                <h3>Achievements</h3>
                <p>Milestones from your competitive journey.</p>
              </div>
              <i class="mdi mdi-medal-outline header-icon"></i>
            </div>

            <div
              v-if="profile.achievements?.length"
              class="achievements-grid"
            >

              <div
                v-for="achievement in profile.achievements"
                :key="achievement.name"
                class="achievement"
                :class="{
                  locked: !achievement.unlocked
                }"
              >

                <div class="achievement-icon">

                  <i
                    :class="[
                      'mdi',

                      achievement.unlocked
                        ? achievement.icon
                        : 'mdi-lock-outline'
                    ]"
                  ></i>

                </div>
                <div>
                  <strong>{{ achievement.name }}</strong>
                  <span>{{ achievement.description }}</span>
                </div>
              </div>
            </div>

            <div
              v-else
              class="empty-state"
            >

              <i class="mdi mdi-medal-outline"></i>
              <p>No achievements available.</p>
            </div>
          </div>

          <div class="dashboard-card account-card">
            <div class="section-header">
              <div>
                <h3>Account</h3>
                <p>Your account information.</p>
              </div>
              <i class="mdi mdi-account-outline header-icon"></i>
            </div>

            <div class="account-list">
              <div class="account-row">
                <div>
                  <span class="account-label">Username</span>
                  <strong>{{ profile.user?.username || "—" }}</strong>
                </div>

                <i class="mdi mdi-account-outline"></i>
              </div>

              <div class="account-row">
                <div>
                  <span class="account-label">Email</span>
                  <strong>{{ profile.user?.email || "—" }}</strong>
                </div>

                <i class="mdi mdi-email-outline"></i>
              </div>

              <div class="account-row">
                <div>
                  <span class="account-label">Role</span>
                  <strong class="green">{{ formattedRole }}</strong>
                </div>

                <i class="mdi mdi-shield-account-outline"></i>
              </div>

              <div class="account-row">
                <div>
                  <span class="account-label">Status</span>
                  <strong class="green">{{ profile.user?.status || "Active" }}</strong>
                </div>

                <i class="mdi mdi-check-circle-outline"></i>
              </div>

              <div
                v-if="profile.user?.joinedAt"
                class="account-row"
              >

                <div>
                  <span class="account-label">Member since</span>
                  <strong>
                    {{
                      new Date(
                        profile.user.joinedAt
                      ).toLocaleDateString()
                    }}
                  </strong>
                </div>

                <i class="mdi mdi-calendar-outline"></i>
              </div>
            </div>
          </div>
        </section>

        <section class="quick-actions">
          <div class="quick-header">
            <div>
              <h3>Quick actions</h3>
              <p>Jump back into the competition.</p>
            </div>
          </div>

          <div class="action-grid">
            <router-link
              to="/tournaments"
              class="action-card"
            >

              <div class="action-icon">
                <i class="mdi mdi-trophy-outline"></i>
              </div>


              <div class="action-info">
                <strong>Browse tournaments</strong>
                <span>Discover available competitions.</span>
              </div>

              <i class="mdi mdi-arrow-right action-arrow"></i>
            </router-link>

            <router-link
              to="/my-tournaments"
              class="action-card"
            >

              <div class="action-icon">
                <i class="mdi mdi-gamepad-variant-outline"></i>
              </div>

              <div class="action-info">
                <strong>My tournaments</strong>
                <span>View your current competitions.</span>
              </div>

              <i class="mdi mdi-arrow-right action-arrow"></i>
            </router-link>

            <router-link
              v-if="
                profile.user?.role === 'organizer' ||
                profile.user?.role === 'admin'
              "
              to="/tournaments/create"
              class="action-card"
            >

              <div class="action-icon">
                <i class="mdi mdi-plus-circle-outline"></i>
              </div>


              <div class="action-info">
                <strong>Create tournament</strong>
                <span>Start a new competition.</span>
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
import {
  computed,
  ref,
  onMounted,
} from "vue";

import api from "../services/api";


const profile = ref(null);

const loading = ref(true);

const error = ref(null);


const loadProfile = async () => {
  try {
    loading.value = true;
    error.value = null;

    const res = await api.get(
      "/users/me/profile-data"
    );

    profile.value = res.data;

  } catch (err) {
    console.error(
      "Failed to load profile:",
      err
    );

    error.value =
      "Failed to load profile.";

  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  loadProfile();
});


const userInitial = computed(() => {
  const username =
    profile.value?.user?.username;

  if (!username) {
    return "U";
  }

  return username
    .charAt(0)
    .toUpperCase();
});


const formattedRole = computed(() => {
  const role =
    profile.value?.user?.role;

  if (!role) {
    return "Player";
  }

  return (
    role.charAt(0).toUpperCase() +
    role.slice(1)
  );
});
</script>


<style scoped>
.profile-page {
  min-height: 100vh;
  background: #0b0c10;
  color: white;
  position: relative;
  overflow: hidden;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  padding: 25px;
  box-sizing: border-box;
}

.bg-blur {
  position: absolute;
  top: -200px;
  left: -200px;
  width: 600px;
  height: 600px;
  background:
    radial-gradient(
      circle,
      rgba(75,222,75,0.25),
      transparent 60%
    );
  filter: blur(60px);
  pointer-events: none;
}

.bg-blur-second {
  position: absolute;
  right: -300px;
  bottom: 100px;
  width: 550px;
  height: 550px;
  background:
    radial-gradient(
      circle,
      rgba(75,222,75,0.08),
      transparent 65%
    );
  filter: blur(80px);
  pointer-events: none;
}

.profile-container {
  position: relative;
  z-index: 1;
  max-width: 1050px;
  margin: auto;
  padding: 105px 20px 80px;
}

.page-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 45px;
}

.tag {
  margin: 0 0 13px;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.6;
}

.page-header h1 {
  margin: 0 0 15px;
  font-size: 42px;
  font-weight: 600;
  line-height: 1.2;
}

.page-header h1 span {
  color: #4BDE4B;
}

.subtitle {
  margin: 0;
  font-size: 15px;
  opacity: 0.6;
  line-height: 1.6;
}

.profile-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  padding: 30px;
  margin-bottom: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
  background:
    linear-gradient(
      115deg,
      rgba(75,222,75,0.08),
      rgba(255,255,255,0.025)
    );

  transition: 0.2s;
}

.profile-banner:hover {
  border-color: rgba(75,222,75,0.22);
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 22px;
}

.avatar {
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(75,222,75,0.1);
  border: 1px solid rgba(75,222,75,0.3);
  box-shadow: 0 0 35px rgba(75,222,75,0.08);
  color: #4BDE4B;
  font-size: 32px;
  font-weight: 600;
}

.online-dot {
  position: absolute;
  right: 4px;
  bottom: 6px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #4BDE4B;
  border: 3px solid #0b0c10;
}

.profile-details {
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 7px;
}

.name-row h2 {
  margin: 0;
  font-size: 25px;
  font-weight: 600;
}

.role-badge {
  padding: 4px 9px;
  border-radius: 20px;
  border: 1px solid rgba(75,222,75,0.2);
  background: rgba(75,222,75,0.08);
  color: #4BDE4B;
  font-size: 10px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.profile-description {
  margin: 0 0 12px;
  font-size: 13px;
  opacity: 0.5;
}

.profile-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 17px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.profile-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-meta i {
  color: rgba(75,222,75,0.8);
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.85);
  font: inherit;
  cursor: pointer;
  transition: 0.2s;
}

.edit-btn:hover {
  color: #4BDE4B;
  border-color: rgba(75,222,75,0.3);
  background: rgba(75,222,75,0.06);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  transition: 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(75,222,75,0.25);
}

.stat-icon {
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(75,222,75,0.08);
  color: #4BDE4B;
}

.stat-icon i {
  font-size: 18px;
}

.stat-card strong {
  display: block;
  margin-bottom: 2px;
  font-size: 19px;
  font-weight: 600;
}

.stat-card span {
  display: block;
  font-size: 11px;
  opacity: 0.45;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.bottom-grid {
  grid-template-columns: 1.5fr 1fr;
}

.dashboard-card {
  padding: 22px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding-bottom: 17px;
  margin-bottom: 5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.section-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  font-size: 11px;
  opacity: 0.45;
}

.section-header a {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4BDE4B;
  font-size: 11px;
  text-decoration: none;
  white-space: nowrap;
}

.section-header a:hover {
  color: #35AB35;
}

.header-icon {
  color: #4BDE4B;
  font-size: 23px;
  opacity: 0.7;
}

.tournament-list {
  display: flex;
  flex-direction: column;
}

.tournament-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 2px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.tournament-row:last-child {
  border-bottom: none;
}

.tournament-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  color: #4BDE4B;
}

.tournament-icon i {
  font-size: 18px;
}

.tournament-info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.tournament-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
}

.tournament-info > span {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.4;
}

.dot {
  margin: 0 3px;
}

.placement {
  min-width: 34px;
  padding: 5px 7px;
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.6);
}

.placement.second {
  color: rgba(255,255,255,0.85);
}

.placement.winner {
  color: #4BDE4B;
  background: rgba(75,222,75,0.08);
  border: 1px solid rgba(75,222,75,0.12);
}

.games-list {
  display: flex;
  flex-direction: column;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 2px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.game-item:last-child {
  border-bottom: none;
}

.game-icon {
  width: 37px;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  color: #4BDE4B;
  background: rgba(75,222,75,0.07);
}

.game-item > div:last-child {
  display: flex;
  flex-direction: column;
}

.game-item strong {
  font-size: 13px;
  font-weight: 500;
}

.game-item span {
  margin-top: 3px;
  font-size: 10px;
  opacity: 0.4;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 14px;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px;
  border-radius: 9px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  transition: 0.2s;
}

.achievement:hover {
  border-color: rgba(75,222,75,0.18);
}

.achievement-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(75,222,75,0.08);
  color: #4BDE4B;
}

.achievement > div:last-child {
  display: flex;
  flex-direction: column;
}

.achievement strong {
  font-size: 11px;
  font-weight: 500;
}

.achievement span {
  margin-top: 3px;
  font-size: 9px;
  opacity: 0.4;
}

.achievement.locked {
  opacity: 0.35;
}

.account-list {
  display: flex;
  flex-direction: column;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 13px 2px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.account-row:last-child {
  border-bottom: none;
}

.account-row > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.account-label {
  margin-bottom: 4px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.35;
}

.account-row strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
}

.account-row strong.green {
  color: #4BDE4B;
}

.account-row > i {
  flex-shrink: 0;
  font-size: 17px;
  color: rgba(255,255,255,0.25);
}

.quick-actions {
  margin-top: 35px;
}

.quick-header {
  margin-bottom: 15px;
}

.quick-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.quick-header p {
  margin: 0;
  font-size: 12px;
  opacity: 0.45;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.action-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: white;
  text-decoration: none;
  transition: 0.2s;
}

.action-card:hover {
  transform: translateY(-3px);
  border-color: rgba(75,222,75,0.25);
  background: rgba(75,222,75,0.025);
}

.action-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(75,222,75,0.08);
  color: #4BDE4B;
}

.action-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding-right: 15px;
}

.action-info strong {
  margin-bottom: 3px;
  font-size: 12px;
  font-weight: 500;
}

.action-info span {
  font-size: 10px;
  opacity: 0.4;
  line-height: 1.4;
}

.action-arrow {
  position: absolute;
  right: 14px;
  color: rgba(255,255,255,0.2);
  transition: 0.2s;
}

.action-card:hover .action-arrow {
  transform: translateX(2px);
  color: #4BDE4B;
}

.profile-loading {
  min-height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255,255,255,0.5);
}

.profile-loading i {
  font-size: 28px;
  color: #4BDE4B;
}

.profile-error {
  margin-top: 50px;
  padding: 20px;
  text-align: center;
  color: #ff6464;
  border-radius: 10px;
  border: 1px solid rgba(255,100,100,0.15);
  background: rgba(255,100,100,0.05);
}

.empty-state {
  min-height: 135px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: rgba(255,255,255,0.3);
}

.empty-state > i {
  font-size: 27px;
  color: rgba(75,222,75,0.45);
}

.empty-state p {
  margin: 0;
  font-size: 11px;
}

.empty-link {
  margin-top: 3px;
  color: #4BDE4B;
  text-decoration: none;
  font-size: 11px;
  transition: 0.2s;
}

.empty-link:hover {
  color: #35AB35;
}

.tournament-status {
  flex-shrink: 0;
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(75,222,75,0.08);
  border: 1px solid rgba(75,222,75,0.12);
  color: #4BDE4B;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

@media (max-width: 900px) {
  .profile-container {
    padding-top: 100px;
  }

  .page-header h1 {
    font-size: 34px;
  }

  .profile-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .profile-page {
    padding: 15px;
  }

  .profile-container {
    padding-left: 5px;
    padding-right: 5px;
  }

  .profile-main {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 430px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
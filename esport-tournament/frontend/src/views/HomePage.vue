<template>
  <div class="home">

    <!-- dekoracija/blurr na backgroundu -->
    <div class="bg-blur"></div>

    <section class="hero">

      <div class="hero-inner">

        <p class="tag">Competitive eSports Platform</p>

        <h1>
          Build your <span>gaming career</span> through tournaments.
        </h1>

        <p class="subtitle">
          Join structured competitions, track rankings, and compete with players worldwide.
        </p>

        <div class="actions">
          <router-link to="/tournaments" class="btn primary">
            Explore tournaments
          </router-link>

          <router-link to="/register" class="btn ghost">
            Get started
          </router-link>
        </div>

        <div class="mini-stats">
          <div>
            <strong>120+</strong>
            <span>Tournaments</span>
          </div>

          <div>
            <strong>3k+</strong>
            <span>Players</span>
          </div>

          <div>
            <strong>25</strong>
            <span>Games</span>
          </div>
        </div>

      </div>

    </section>

    <section class="features">

      <div class="feature">
        <h3>Structured competition</h3>
        <p>Fair matchmaking and tournament brackets for all skill levels.</p>
      </div>

      <div class="feature">
        <h3>Live results</h3>
        <p>Real-time updates, standings and match tracking.</p>
      </div>

      <div class="feature">
        <h3>Player growth</h3>
        <p>Rank up, track performance and build your profile.</p>
      </div>

    </section>

  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #0b0c10;
  color: white;
  overflow: hidden;
  position: relative;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  padding: 25px;
}

.bg-blur {
  position: absolute;
  top: -200px;
  left: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(75,222,75,0.25), transparent 60%);
  filter: blur(60px);
}

.hero {
  display: flex;
  justify-content: center;
  padding: 120px 20px 80px;
  text-align: center;
}

.hero-inner {
  max-width: 750px;
}

.tag {
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 15px;
}

h1 {
  font-size: 48px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 20px;
}

h1 span {
  color: #4BDE4B;
}

.subtitle {
  font-size: 16px;
  opacity: 0.7;
  line-height: 1.6;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 50px;
}

.btn {
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 14px;
  text-decoration: none;
  transition: 0.2s;
  font-weight: 500;
}

.primary {
  background: #4BDE4B;
  color: white;
}

.primary:hover {
  transform: translateY(-2px);
  background: #35AB35;
}

.ghost {
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
}

.ghost:hover {
  background: rgba(255,255,255,0.05);
}

.mini-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.mini-stats div {
  text-align: center;
}

.mini-stats strong {
  display: block;
  font-size: 20px;
}

.mini-stats span {
  font-size: 12px;
  opacity: 0.6;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1000px;
  margin: auto;
  padding: 80px 20px;
}

.feature {
  padding: 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  transition: 0.2s;
}

.feature:hover {
  transform: translateY(-4px);
  border-color: rgba(75,222,75,0.25);
}

.feature h3 {
  margin-bottom: 8px;
}

.feature p {
  font-size: 13px;
  opacity: 0.6;
  line-height: 1.5;
}

@media (max-width: 900px) {
  h1 {
    font-size: 34px;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .mini-stats {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
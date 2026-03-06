<template>
  <div class="star-entry">
    <div class="star-designation">✦ {{ star.designation }}</div>
    <div class="log-data">
      <div class="star-detail">
        Spectral Class:
        <span class="star-class">{{ star.spectralClass }}{{ star.subtype }} {{ star.luminosityClass }}</span>
      </div>
      <div class="star-detail">Mass: {{ star.mass }} M☉ | Temperature: {{ star.temperature }}K</div>
      <div class="star-detail">Luminosity: {{ star.luminosity }} L☉</div>
      <div v-if="star.hasGasGiants" class="star-detail gas-giant">Gas Giants: ✓ DETECTED</div>
      <div v-if="star.hasPlanetoidBelts" class="star-detail planetoid-belt">Planetoid Belts: ✓ DETECTED</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StarEntry",
  props: {
    star: {
      type: Object,
      required: true,
      validator: (value) => {
        return (
          value.designation &&
          value.spectralClass &&
          typeof value.subtype === "number" &&
          value.luminosityClass &&
          typeof value.mass === "number" &&
          typeof value.temperature === "number" &&
          typeof value.luminosity === "number"
        );
      },
    },
  },
};
</script>

<style scoped>
.star-entry {
  margin: 10px 0;
  padding: 8px;
  border-left: 3px solid #00ff00;
  background: rgba(0, 255, 0, 0.05);
  border-radius: 2px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.star-designation {
  color: #ffff00;
  font-weight: bold;
  font-size: 1.05em;
  margin-bottom: 5px;
  text-shadow: 0 0 5px #ffff00;
}

.log-data {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.star-detail {
  color: #00aaff;
  font-size: 0.9em;
  line-height: 1.3;
}

.star-class {
  color: #00ffff;
  font-weight: bold;
}

.gas-giant {
  color: #ffaa00;
  margin-top: 3px;
}

.planetoid-belt {
  color: #ff8800;
}
</style>

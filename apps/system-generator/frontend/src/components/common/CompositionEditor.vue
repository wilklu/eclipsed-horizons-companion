<template>
  <div class="composition-editor">
    <div class="editor-header">
      <input v-model="local.description" placeholder="Description" class="desc-input" />
      <input v-model.number="local.metallicity" type="number" step="0.01" placeholder="Metallicity" class="small-input" />
      <input v-model="local.oxidationState" placeholder="Oxidation" class="small-input" />
      <button type="button" class="btn btn-small" @click="normalizeBulk">Normalize</button>
    </div>

    <div class="section">
      <div class="section-title">Bulk Element Abundances</div>
      <div class="rows">
        <div class="row" v-for="(e, idx) in local.bulkElementAbundances" :key="idx">
          <input v-model="e.element" placeholder="Element" class="elem-input" />
          <input v-model.number="e.weightPercent" type="number" step="0.01" class="pct-input" placeholder="%" />
          <button type="button" class="btn-remove" @click="removeBulk(idx)">✕</button>
        </div>
        <div class="row-actions">
          <button type="button" class="btn btn-small btn-add" @click="addBulk">+ Add Element</button>
          <small class="muted">Weights are percentages (will be scaled by Normalize)</small>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Volatiles</div>
      <div class="rows">
        <div class="row" v-for="(v, vi) in local.volatiles" :key="vi">
          <input v-model="v.species" placeholder="Species" class="elem-input" />
          <input v-model.number="v.weightPercent" type="number" step="0.0001" class="pct-input" placeholder="%" />
          <button type="button" class="btn-remove" @click="removeVolatile(vi)">✕</button>
        </div>
        <div class="row-actions">
          <button type="button" class="btn btn-small btn-add" @click="addVolatile">+ Add Volatile</button>
          <small class="muted">Volatiles are included for reference and exported as-is</small>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Major Reservoirs</div>
      <div class="reservoirs">
        <label>Core (comma-separated)</label>
        <input v-model="coreText" @change="updateReservoir('core', coreText)" class="reservoir-input" />
        <label>Mantle (comma-separated)</label>
        <input v-model="mantleText" @change="updateReservoir('mantle', mantleText)" class="reservoir-input" />
        <label>Crust (comma-separated)</label>
        <input v-model="crustText" @change="updateReservoir('crust', crustText)" class="reservoir-input" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from "vue";
import { normalizeCompositionDetailed } from "../../utils/wbh/planetaryCompositionApi.js";

const props = defineProps({ modelValue: { type: Object, default: null } });
const emit = defineEmits(["update:modelValue"]);

const local = reactive(normalizeCompositionDetailed(props.modelValue || {}));

watch(
  () => props.modelValue,
  (v) => {
    const norm = normalizeCompositionDetailed(v || {});
    // assign properties without replacing reactive object
    Object.keys(norm).forEach((k) => {
      local[k] = norm[k];
    });
  },
  { deep: true },
);

const emitChange = () => {
  const payload = {
    code: local.code ?? null,
    description: local.description ?? "",
    metallicity: typeof local.metallicity === "number" ? local.metallicity : null,
    oxidationState: local.oxidationState ?? null,
    bulkElementAbundances: Array.isArray(local.bulkElementAbundances)
      ? local.bulkElementAbundances.map((e) => ({ element: String(e.element || ""), weightPercent: Number(e.weightPercent || 0) }))
      : [],
    atomicComposition: Array.isArray(local.atomicComposition) ? local.atomicComposition.slice() : [],
    majorReservoirs: {
      core: Array.isArray(local.majorReservoirs?.core) ? local.majorReservoirs.core.slice() : [],
      mantle: Array.isArray(local.majorReservoirs?.mantle) ? local.majorReservoirs.mantle.slice() : [],
      crust: Array.isArray(local.majorReservoirs?.crust) ? local.majorReservoirs.crust.slice() : [],
    },
    volatiles: Array.isArray(local.volatiles) ? local.volatiles.map((v) => ({ species: String(v.species || ""), weightPercent: Number(v.weightPercent || 0) })) : [],
    provenance: local.provenance ?? null,
  };
  emit("update:modelValue", payload);
};

function addBulk() {
  if (!Array.isArray(local.bulkElementAbundances)) local.bulkElementAbundances = [];
  local.bulkElementAbundances.push({ element: "", weightPercent: 0 });
  emitChange();
}

function removeBulk(idx) {
  if (!Array.isArray(local.bulkElementAbundances)) return;
  local.bulkElementAbundances.splice(idx, 1);
  emitChange();
}

function addVolatile() {
  if (!Array.isArray(local.volatiles)) local.volatiles = [];
  local.volatiles.push({ species: "", weightPercent: 0 });
  emitChange();
}

function removeVolatile(idx) {
  if (!Array.isArray(local.volatiles)) return;
  local.volatiles.splice(idx, 1);
  emitChange();
}

function normalizeBulk() {
  const arr = Array.isArray(local.bulkElementAbundances) ? local.bulkElementAbundances : [];
  const total = arr.reduce((s, e) => s + (Number(e.weightPercent) || 0), 0);
  if (total <= 0) return;
  const scale = 100 / total;
  arr.forEach((e) => {
    // ensure numeric conversion
    e.weightPercent = Number(e.weightPercent || 0) * scale;
  });
  emitChange();
}

const coreText = computed({
  get: () => (Array.isArray(local.majorReservoirs?.core) ? local.majorReservoirs.core.join(", ") : ""),
  set: (v) => updateReservoir("core", v),
});
const mantleText = computed({
  get: () => (Array.isArray(local.majorReservoirs?.mantle) ? local.majorReservoirs.mantle.join(", ") : ""),
  set: (v) => updateReservoir("mantle", v),
});
const crustText = computed({
  get: () => (Array.isArray(local.majorReservoirs?.crust) ? local.majorReservoirs.crust.join(", ") : ""),
  set: (v) => updateReservoir("crust", v),
});

function updateReservoir(name, text) {
  if (!local.majorReservoirs || typeof local.majorReservoirs !== "object") local.majorReservoirs = { core: [], mantle: [], crust: [] };
  const arr = String(text || "").split(",").map((s) => String(s || "").trim()).filter(Boolean);
  local.majorReservoirs[name] = arr;
  emitChange();
}

// watch for local changes (simple deep watcher) and emit
watch(
  () => [local.bulkElementAbundances, local.volatiles, local.description, local.metallicity, local.oxidationState, local.majorReservoirs],
  () => {
    emitChange();
  },
  { deep: true },
);
</script>

<style scoped>
.composition-editor {
  border: 1px solid #ddd;
  padding: 8px;
  background: #fafafa;
}
.editor-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.desc-input { flex: 1; padding: 6px; }
.small-input { width: 100px; padding: 6px; }
.section { margin-top: 8px; }
.section-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; }
.rows .row { display:flex; gap:6px; align-items:center; margin-bottom:6px }
.elem-input { flex: 1; padding:6px }
.pct-input { width:110px; padding:6px }
.reservoir-input { width:100%; padding:6px; margin-bottom:6px }
.row-actions { display:flex; gap:8px; align-items:center }
.btn-remove { background:transparent; border:none; color:#900; font-weight:bold }
</style>

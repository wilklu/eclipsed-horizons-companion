<template>
  <div class="history-generator">
    <LoadingSpinner v-bind="historyExportOverlayProps" />
    <SurveyNavigation
      currentClass="Procedural History Generator"
      :show-regenerate="!!history"
      :show-export="!!history"
      :back-route="backRoute"
      @regenerate="generateHistory"
      @export="exportHistory"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Civilization Name:</label>
          <div class="name-row">
            <input v-model="civName" placeholder="Enter civilization name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
          </div>
        </div>
        <div class="control-group">
          <label>History Length:</label>
          <select v-model="historyLength" class="select-input">
            <option value="short">Short (5 events)</option>
            <option value="medium">Medium (10 events)</option>
            <option value="long">Long (20 events)</option>
          </select>
        </div>
        <div class="control-group">
          <label>Seed (optional):</label>
          <input v-model="historySeed" placeholder="history-seed" class="text-input" />
        </div>
        <div class="control-group">
          <label>History Span (years ago):</label>
          <input v-model.number="eraStart" type="number" min="100" max="13000000000" step="1000" class="text-input" />
        </div>
        <div class="control-group control-action">
          <div class="action-stack">
            <button class="btn btn-primary" @click="generateHistory">⚡ Generate History</button>
            <button class="btn btn-secondary" :disabled="!history" @click="evolveHistory">🧬 Evolve History</button>
            <button class="btn btn-secondary" :disabled="!history" @click="saveHistoryRecord">💾 Save History</button>
          </div>
        </div>
      </div>

      <div v-if="historySeedCards.length" class="history-seed-panel">
        <div v-for="card in historySeedCards" :key="card.label" class="seed-card">
          <div class="seed-card-label">{{ card.label }}</div>
          <div class="seed-card-value">{{ card.value }}</div>
        </div>
      </div>

      <div class="history-category-panel">
        <div class="seed-card">
          <div class="seed-card-label">Event Categories</div>
          <div class="category-chip-list">
            <span
              v-for="entry in historyCategoryCards"
              :key="entry.name"
              class="category-chip"
              :title="`${entry.description} — ${Array.isArray(entry.subcategories) ? entry.subcategories.join(', ') : ''}`"
            >
              {{ entry.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="savedHistories.length" class="saved-history-panel">
        <div class="seed-card">
          <div class="people-panel-header">
            <h3>Saved Histories</h3>
            <span class="meta-badge">{{ savedHistories.length }} archived records</span>
          </div>
          <div class="saved-history-list">
            <article v-for="record in savedHistories.slice(0, 6)" :key="record.id" class="saved-history-card">
              <div class="person-name">{{ record.civilizationName }}</div>
              <div class="person-role">
                {{ record.worldName || "Unlinked Archive" }} · {{ record.updatedAt?.slice(0, 10) }}
              </div>
              <div class="person-summary">
                {{ record.overview?.["Historical Themes"] || "No historical summary recorded yet." }}
              </div>
              <div class="saved-history-buttons">
                <button class="btn btn-secondary" @click="loadSavedHistory(record)">Load</button>
                <button class="btn btn-secondary" @click="deleteSavedHistory(record.id)">Delete</button>
              </div>
            </article>
          </div>
        </div>
      </div>

      <!-- History Timeline -->
      <div v-if="history" class="history-display">
        <div class="history-header">
          <h2>{{ history.civilizationName }}</h2>
          <div class="history-meta">
            <span class="meta-badge">{{ history.events.length }} recorded events</span>
            <span class="meta-badge">Span: {{ formatSpan(history.events) }}</span>
            <span class="meta-badge">Now: {{ history.currentDateLabel }}</span>
          </div>
        </div>

        <!-- Key Stats -->
        <div class="key-stats">
          <div class="kstat" v-for="(v, k) in history.overview" :key="k">
            <div class="kstat-label">{{ k }}</div>
            <div class="kstat-value">{{ v }}</div>
          </div>
        </div>

        <div v-if="history.notablePeople?.length" class="notable-people-panel">
          <div class="people-panel-header">
            <h3>Important People</h3>
            <span class="meta-badge">{{ history.notablePeople.length }} tracked lives</span>
          </div>
          <div class="people-grid">
            <article v-for="person in history.notablePeople" :key="person.name" class="person-card">
              <div class="person-name">{{ person.name }}</div>
              <div class="person-role">{{ person.role }} · {{ person.epithet }}</div>
              <div v-if="person.dynasty" class="person-dynasty">
                {{ person.dynasty }} · Generation {{ person.generation }} · {{ person.familyRole }}
              </div>
              <div class="person-summary">{{ person.summary }}</div>
              <div
                v-if="person.spouseName || person.siblingNames?.length || person.mentorName || person.rivalName"
                class="person-kinship"
              >
                <div v-if="person.legendStatus">Status: {{ person.legendStatus }}</div>
                <div v-if="person.spouseName">Marriage: {{ person.spouseName }}</div>
                <div v-if="person.siblingNames?.length">Siblings: {{ person.siblingNames.join(", ") }}</div>
                <div v-if="person.mentorName">Mentor: {{ person.mentorName }}</div>
                <div v-if="person.rivalName">Rival: {{ person.rivalName }}</div>
                <div v-if="person.heirName">Heir: {{ person.heirName }}</div>
                <div v-if="person.claimantName">Claimant: {{ person.claimantName }}</div>
                <div v-if="person.childProfiles?.length">
                  Children: {{ person.childProfiles.map((child) => child.name).join(", ") }}
                </div>
              </div>
              <div class="person-life-list">
                <div
                  v-for="entry in person.lifeEvents"
                  :key="`${person.name}-${entry.type}-${entry.yearsAgo}`"
                  class="person-life-row"
                >
                  <span class="person-life-type">{{ entry.type }}</span>
                  <span class="person-life-date">{{ formatYear(entry) }}</span>
                  <span class="person-life-label">{{ entry.label }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div v-if="history.dynasties?.length" class="family-tree-panel">
          <div class="people-panel-header">
            <h3>Family Tree</h3>
            <div class="family-tree-header-actions">
              <span class="meta-badge">{{ history.dynasties.length }} dynasties</span>
              <button
                v-if="focusedFamilyMember"
                class="btn btn-secondary family-clear-button"
                @click="clearFamilyFocus"
              >
                Clear Focus
              </button>
            </div>
          </div>
          <div v-if="focusedFamilyMember" class="family-focus-banner">
            <strong>{{ focusedFamilyMember.name }}</strong>
            <span>{{ focusedFamilyMember.dynasty }}</span>
            <span>{{ focusedFamilyMember.familyRole }} · Gen {{ focusedFamilyMember.generation }}</span>
          </div>
          <div class="dynasty-grid">
            <details
              v-for="dynasty in history.dynasties"
              :key="dynasty.id"
              class="dynasty-card"
              :class="familyTreeCardClass(dynasty.id)"
              :open="history.dynasties.length <= 2"
            >
              <summary class="dynasty-summary-row">
                <div>
                  <div class="person-name">{{ dynasty.name }}</div>
                  <div class="person-role">Founder · {{ dynasty.founderName }}</div>
                </div>
                <span class="meta-badge">{{ dynasty.generations }} generations</span>
              </summary>
              <div class="person-dynasty">Rival House: {{ dynasty.rivalDynasty }}</div>
              <div class="person-dynasty">
                Alliance Bloc: {{ dynasty.alliedDynasty }} · Cadet Branch: {{ dynasty.cadetBranchName }}
              </div>
              <div class="person-summary">{{ dynasty.summary }}</div>
              <div class="dynasty-crisis">⚠️ {{ dynasty.inheritanceCrisis }}</div>
              <div class="person-kinship">{{ dynasty.feudSummary }}</div>
              <div class="person-kinship">{{ dynasty.betrayalSummary }}</div>
              <div class="tree-link-map">
                <div
                  v-for="link in familyTreeLinksFor(dynasty.id)"
                  :key="`${dynasty.id}-${link.type}-${link.parent}-${link.child}`"
                  class="tree-link-row"
                  :class="[`link-${link.type}`, familyTreeLinkClass(dynasty.id, link)]"
                >
                  <span>{{ relationGlyph(link.type) }}</span>
                  <span>{{ formatTreeLink(link) }}</span>
                </div>
              </div>
              <div class="generation-board">
                <div
                  v-for="lane in familyTreeGenerationRows(dynasty.id)"
                  :key="`${dynasty.id}-gen-${lane.generation}`"
                  class="generation-lane"
                >
                  <div class="generation-lane-label">Gen {{ lane.generation }}</div>
                  <div class="generation-lane-members">
                    <div
                      v-for="member in lane.members"
                      :key="`${dynasty.id}-lane-${lane.generation}-${member.name}`"
                      class="generation-member"
                      :class="familyMemberClass(dynasty.id, member)"
                      role="button"
                      tabindex="0"
                      @click="focusFamilyMember(dynasty.id, member.name)"
                      @keydown.enter.prevent="focusFamilyMember(dynasty.id, member.name)"
                      @keydown.space.prevent="focusFamilyMember(dynasty.id, member.name)"
                    >
                      <strong>{{ member.name }}</strong>
                      <span>{{ member.familyRole }}</span>
                      <span v-if="member.parentName">Child of {{ member.parentName }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="lineage-list">
                <div
                  v-for="member in dynasty.members"
                  :key="`${dynasty.id}-${member.name}-${member.generation}`"
                  class="lineage-row"
                  :class="familyMemberClass(dynasty.id, member)"
                >
                  <div class="lineage-generation">Gen {{ member.generation }}</div>
                  <div
                    class="lineage-copy"
                    role="button"
                    tabindex="0"
                    @click="focusFamilyMember(dynasty.id, member.name)"
                    @keydown.enter.prevent="focusFamilyMember(dynasty.id, member.name)"
                    @keydown.space.prevent="focusFamilyMember(dynasty.id, member.name)"
                  >
                    <strong>{{ member.name }}</strong>
                    <span>{{ member.role }} · {{ member.familyRole }} · {{ member.legendStatus }}</span>
                    <span v-if="member.parentName">Child of {{ member.parentName }}</span>
                    <span v-else>Founder of the line</span>
                    <span v-if="member.spouseName">Married to {{ member.spouseName }}</span>
                    <span v-if="member.siblingNames?.length">Siblings: {{ member.siblingNames.join(", ") }}</span>
                    <span v-if="member.heirName">Named heir: {{ member.heirName }}</span>
                    <span v-if="member.claimantName">Rival claimant: {{ member.claimantName }}</span>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline-panel">
          <div class="timeline-view-header">
            <h3>Timeline View</h3>
            <div class="timeline-view-controls">
              <div class="timeline-era-filter-group" data-test="timeline-era-filter">
                <span class="timeline-era-filter-label">Era</span>
                <div class="timeline-era-chip-list" role="tablist" aria-label="Timeline era filter">
                  <button
                    class="timeline-era-chip"
                    :class="{ 'timeline-era-chip-active': timelineEraFilter === 'all' }"
                    role="tab"
                    :aria-selected="timelineEraFilter === 'all'"
                    @click="timelineEraFilter = 'all'"
                  >
                    All
                  </button>
                  <button
                    v-for="era in timelineEraOptions"
                    :key="era"
                    class="timeline-era-chip"
                    :class="{ 'timeline-era-chip-active': timelineEraFilter === era }"
                    role="tab"
                    :aria-selected="timelineEraFilter === era"
                    @click="timelineEraFilter = era"
                  >
                    {{ era }}
                  </button>
                </div>
              </div>

              <div class="timeline-view-toggle" role="tablist" aria-label="Timeline view mode">
                <button
                  class="btn btn-secondary timeline-toggle-btn"
                  :class="{ 'timeline-toggle-active': timelineViewMode === 'list' }"
                  role="tab"
                  :aria-selected="timelineViewMode === 'list'"
                  @click="timelineViewMode = 'list'"
                >
                  List
                </button>
                <button
                  class="btn btn-secondary timeline-toggle-btn"
                  :class="{ 'timeline-toggle-active': timelineViewMode === 'track' }"
                  role="tab"
                  :aria-selected="timelineViewMode === 'track'"
                  @click="timelineViewMode = 'track'"
                >
                  Track
                </button>
              </div>
            </div>
          </div>

          <div v-if="timelineViewMode === 'track'" class="timeline-track" data-test="timeline-track-view">
            <div v-if="!timelineTrackLanes.length" class="timeline-empty-state">
              No recorded events for this era selection.
            </div>
            <div
              v-for="lane in timelineTrackLanes"
              :key="`lane-${lane.era}`"
              class="timeline-track-lane"
              :data-era="lane.era"
            >
              <div class="timeline-track-lane-label">{{ lane.era }}</div>
              <div class="timeline-track-axis"></div>
              <div
                v-for="(event, index) in lane.events"
                :key="`track-${lane.era}-${index}-${event.title}`"
                class="timeline-track-node"
                :class="[
                  event.category.toLowerCase().replace(/\s+/g, '-'),
                  index % 2 === 0 ? 'timeline-track-node-top' : 'timeline-track-node-bottom',
                ]"
                :style="{ left: `${event.positionPct}%` }"
              >
                <div class="timeline-track-dot"></div>
                <div class="timeline-track-card">
                  <div class="event-category">
                    {{ event.category }}<span v-if="event.subcategory"> · {{ event.subcategory }}</span>
                  </div>
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-year">{{ formatYear(event) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="timeline" data-test="timeline-list-view">
            <div v-if="!filteredTimelineEvents.length" class="timeline-empty-state">
              No recorded events for this era selection.
            </div>
            <div
              v-for="(event, i) in filteredTimelineEvents"
              :key="i"
              class="timeline-event"
              :class="event.category.toLowerCase().replace(/\s+/g, '-')"
            >
              <div class="event-year">{{ formatYear(event) }}</div>
              <div class="event-connector">
                <div class="connector-dot"></div>
                <div class="connector-line"></div>
              </div>
              <div class="event-content">
                <div class="event-category">
                  {{ event.category }}<span v-if="event.subcategory"> · {{ event.subcategory }}</span> ·
                  {{ formatEra(event) }}
                </div>
                <div class="event-title">{{ event.title }}</div>
                <div class="event-description">{{ event.description }}</div>
                <div v-if="event.causedBy" class="event-cause">Cause: {{ event.causedBy }}</div>
                <div v-if="event.relatedDynasty" class="event-cause">House: {{ event.relatedDynasty }}</div>
                <div v-if="event.consequence" class="event-consequence">➜ {{ event.consequence }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { useHistoryStore } from "../../stores/historyStore.js";
import {
  createHistorySeededRng,
  EVENT_CATEGORY_DEFINITIONS,
  generateProceduralHistory,
} from "../../utils/history/proceduralHistory.js";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import * as toastService from "../../utils/toast.js";

const route = useRoute();
const router = useRouter();
const historyStore = useHistoryStore();
const backRoute = computed(
  () => deserializeReturnRoute(String(route.query.returnTo || "")) || { name: "GalaxySurvey" },
);
const historyContext = computed(() => ({
  worldName: String(route.query.worldName || "").trim(),
  government: String(route.query.government || "").trim(),
  diplomaticPosture: String(route.query.diplomaticPosture || "").trim(),
  pressureLevel: String(route.query.pressureLevel || "").trim(),
  techBand: String(route.query.techBand || "").trim(),
  worldTraits: Array.isArray(route.query.worldTraits)
    ? route.query.worldTraits.join(", ")
    : String(route.query.worldTraits || "").trim(),
  flashpoint: String(route.query.flashpoint || "").trim(),
  conflictSummary: String(route.query.conflictSummary || "").trim(),
  eventHook: String(route.query.eventHook || "").trim(),
}));
const historySeedCards = computed(() =>
  [
    historyContext.value.worldName ? { label: "World", value: historyContext.value.worldName } : null,
    historyContext.value.government ? { label: "Government", value: historyContext.value.government } : null,
    historyContext.value.techBand ? { label: "Tech Band", value: historyContext.value.techBand } : null,
    historyContext.value.diplomaticPosture
      ? { label: "Diplomatic Posture", value: historyContext.value.diplomaticPosture }
      : null,
    historyContext.value.pressureLevel ? { label: "Pressure", value: historyContext.value.pressureLevel } : null,
    historyContext.value.worldTraits ? { label: "World Traits", value: historyContext.value.worldTraits } : null,
    historyContext.value.flashpoint ? { label: "Flashpoint", value: historyContext.value.flashpoint } : null,
    historyContext.value.conflictSummary
      ? { label: "Faction Pressure", value: historyContext.value.conflictSummary }
      : null,
    historyContext.value.eventHook ? { label: "Current Hook", value: historyContext.value.eventHook } : null,
  ].filter(Boolean),
);

const { overlayProps: historyExportOverlayProps, exportJson: exportHistoryArchive } = useArchiveTransfer({
  noun: "History",
  title: "History Export In Progress",
  barLabel: "Packaging history archive for transfer",
  statusPrefix: "HIST",
  targetLabel: () => history.value?.civilizationName || "Archive target pending",
});

const historyCategoryCards = EVENT_CATEGORY_DEFINITIONS;
const savedHistories = computed(() =>
  historyStore.historiesByWorld({
    systemId: String(route.query.systemId || route.query.systemRecordId || "").trim(),
    worldName: historyContext.value.worldName,
  }),
);
const focusedFamilyMemberKey = ref(String(route.query.familyFocus || "").trim());

const CIV_PREFIXES = ["Vel", "Kra", "Shal", "Dun", "Mrak", "Oth", "Ix", "Cor"];
const CIV_SUFFIXES = ["athi Empire", "an Compact", "ite Confederation", "ori League", "ak Dominion"];

// ── State ─────────────────────────────────────────────────────────────────────
const civName = ref(String(route.query.civilizationName || route.query.worldName || ""));
const historyLength = ref(String(route.query.historyLength || "medium"));
const historySeed = ref(String(route.query.seed || "").trim());
const eraStart = ref(Number(route.query.eraStart || 5000));
const timelineViewMode = ref(String(route.query.timelineView || "") === "track" ? "track" : "list");
const timelineEraFilter = ref(String(route.query.timelineEra || "all"));
const history = ref(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatYear(event) {
  if (event?.date?.fullLabel) {
    return event.date.fullLabel;
  }
  if (event?.date?.displayLabel) {
    return event.date.displayLabel;
  }

  const year = Number(event?.year ?? event ?? 0);
  if (year < 0) return `${Math.abs(year)} years ago`;
  return `Year ${year}`;
}

function formatEra(event) {
  return String(event?.date?.era || event?.era || "Recorded Era");
}

function formatSpan(events) {
  if (!events.length) return "—";
  const yearsAgo = events
    .map((entry) => Number(entry?.yearsAgo ?? Math.abs(Number(entry?.year ?? 0))))
    .filter((value) => Number.isFinite(value));
  const span = Math.max(...yearsAgo) - Math.min(...yearsAgo);
  if (span >= 1_000_000_000) return `${(span / 1_000_000_000).toFixed(1)} eons`;
  if (span >= 1_000_000) return `${(span / 1_000_000).toFixed(1)} ages`;
  if (span >= 10_000) return `${(span / 1_000).toFixed(1)}k years`;
  return `${Math.round(span).toLocaleString()} years`;
}

const timelineEraOptions = computed(() => {
  const events = Array.isArray(history.value?.events) ? history.value.events : [];
  return [...new Set(events.map((entry) => formatEra(entry)).filter(Boolean))];
});

const filteredTimelineEvents = computed(() => {
  const events = Array.isArray(history.value?.events) ? [...history.value.events] : [];
  if (timelineEraFilter.value === "all") {
    return events;
  }

  return events.filter((event) => formatEra(event) === timelineEraFilter.value);
});

const timelineTrackLanes = computed(() => {
  const events = filteredTimelineEvents.value;
  if (!events.length) {
    return [];
  }

  const laneMap = new Map();
  for (const event of events) {
    const era = formatEra(event);
    if (!laneMap.has(era)) {
      laneMap.set(era, []);
    }
    laneMap.get(era).push(event);
  }

  return timelineEraOptions.value
    .filter((era) => laneMap.has(era))
    .map((era) => {
      const laneEvents = laneMap.get(era) || [];
      const yearsAgoValues = laneEvents
        .map((entry) => Number(entry?.yearsAgo ?? Math.abs(Number(entry?.year ?? 0))))
        .filter((value) => Number.isFinite(value));
      const minYearsAgo = Math.min(...yearsAgoValues);
      const maxYearsAgo = Math.max(...yearsAgoValues);
      const span = Math.max(1, maxYearsAgo - minYearsAgo);

      return {
        era,
        events: laneEvents.map((event) => {
          const yearsAgo = Number(event?.yearsAgo ?? Math.abs(Number(event?.year ?? 0)));
          const normalized = Number.isFinite(yearsAgo) ? (maxYearsAgo - yearsAgo) / span : 0;
          const positionPct = Math.max(6, Math.min(94, normalized * 100));
          return { ...event, positionPct };
        }),
      };
    });
});

function syncTimelineQueryState() {
  const currentView = String(route.query.timelineView || "");
  const currentEra = String(route.query.timelineEra || "all");
  const currentFamilyFocus = String(route.query.familyFocus || "");
  const nextView = timelineViewMode.value === "track" ? "track" : "list";
  const nextEra = timelineEraFilter.value || "all";
  const nextFamilyFocus = String(focusedFamilyMemberKey.value || "").trim();

  if (currentView === nextView && currentEra === nextEra && currentFamilyFocus === nextFamilyFocus) {
    return;
  }

  const nextQuery = {
    ...route.query,
    timelineView: nextView,
    timelineEra: nextEra === "all" ? undefined : nextEra,
    familyFocus: nextFamilyFocus || undefined,
  };

  router.replace({ query: nextQuery });
}

// ── Actions ───────────────────────────────────────────────────────────────────
function randomizeName() {
  civName.value = pick(CIV_PREFIXES) + pick(CIV_SUFFIXES);
}

function resolveHistoryRng(civilizationName, nextHistoryLength, nextEraStart) {
  const seedText = String(historySeed.value || "").trim();
  if (!seedText) {
    return Math.random;
  }

  const worldSeed = String(historyContext.value.worldName || "").trim();
  return createHistorySeededRng(
    `${seedText}|${civilizationName}|${nextHistoryLength}|${Number(nextEraStart) || 0}|${worldSeed}`,
  );
}

function generateHistory() {
  const resolvedCivilizationName = civName.value || pick(CIV_PREFIXES) + pick(CIV_SUFFIXES);
  civName.value = resolvedCivilizationName;
  history.value = generateProceduralHistory({
    civilizationName: resolvedCivilizationName,
    historyLength: historyLength.value,
    eraStart: eraStart.value,
    context: historyContext.value,
    rng: resolveHistoryRng(resolvedCivilizationName, historyLength.value, eraStart.value),
  });
  if (timelineEraFilter.value !== "all" && !timelineEraOptions.value.includes(timelineEraFilter.value)) {
    timelineEraFilter.value = "all";
  }
}

function familyTreeLinksFor(dynastyId) {
  const links = history.value?.familyTree?.find((entry) => entry.id === dynastyId)?.links || [];
  if (!focusedFamilyMemberKey.value) {
    return links;
  }

  const [focusedDynastyId, focusedMemberName] = focusedFamilyMemberKey.value.split("::");
  if (focusedDynastyId !== dynastyId || !focusedMemberName) {
    return [];
  }

  return links.filter((link) => {
    const isDirectRelation = link?.parent === focusedMemberName || link?.child === focusedMemberName;
    const isPedigreeLink = link?.type === "parent-child" || link?.type === "marriage";
    return isDirectRelation && isPedigreeLink;
  });
}

function familyTreeGenerationRows(dynastyId) {
  const members = history.value?.familyTree?.find((entry) => entry.id === dynastyId)?.members || [];
  const lanes = new Map();
  for (const member of members) {
    const generation = Math.max(1, Number(member?.generation || 1));
    if (!lanes.has(generation)) {
      lanes.set(generation, []);
    }
    lanes.get(generation).push(member);
  }

  return [...lanes.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([generation, generationMembers]) => ({
      generation,
      members: [...generationMembers].sort((left, right) =>
        String(left?.name || "").localeCompare(String(right?.name || "")),
      ),
    }));
}

const focusedFamilyMember = computed(() => {
  if (!focusedFamilyMemberKey.value || !history.value?.familyTree?.length) {
    return null;
  }

  const [dynastyId, memberName] = focusedFamilyMemberKey.value.split("::");
  const dynasty = history.value.familyTree.find((entry) => entry.id === dynastyId);
  const member = dynasty?.members?.find((entry) => entry.name === memberName);
  return member ? { ...member, dynasty: dynasty?.dynastyName || dynasty?.name || "Unknown Dynasty" } : null;
});

function clearFamilyFocus() {
  focusedFamilyMemberKey.value = "";
}

function focusFamilyMember(dynastyId, memberName) {
  const nextKey = `${dynastyId}::${memberName}`;
  focusedFamilyMemberKey.value = focusedFamilyMemberKey.value === nextKey ? "" : nextKey;
}

function getFocusedFamilyTreeState(dynastyId) {
  if (!focusedFamilyMemberKey.value) {
    return { focused: false, relatedNames: new Set() };
  }

  const [focusedDynastyId, focusedMemberName] = focusedFamilyMemberKey.value.split("::");
  if (focusedDynastyId !== dynastyId) {
    return { focused: false, relatedNames: new Set() };
  }

  const dynasty = history.value?.familyTree?.find((entry) => entry.id === dynastyId);
  const members = dynasty?.members || [];
  const selectedMember = members.find((entry) => entry.name === focusedMemberName);
  if (!selectedMember) {
    return { focused: false, relatedNames: new Set() };
  }

  const relatedNames = new Set(
    [selectedMember.name, selectedMember.parentName, selectedMember.spouseName].filter(Boolean),
  );
  (Array.isArray(selectedMember.siblingNames) ? selectedMember.siblingNames : []).forEach((name) =>
    relatedNames.add(name),
  );
  (Array.isArray(selectedMember.childNames) ? selectedMember.childNames : []).forEach((name) => relatedNames.add(name));

  for (const member of members) {
    if (member.parentName === selectedMember.name) {
      relatedNames.add(member.name);
    }
    if ((Array.isArray(member.childNames) ? member.childNames : []).includes(selectedMember.name)) {
      relatedNames.add(member.name);
    }
    if ((Array.isArray(member.siblingNames) ? member.siblingNames : []).includes(selectedMember.name)) {
      relatedNames.add(member.name);
    }
    if (member.spouseName === selectedMember.name) {
      relatedNames.add(member.name);
    }
  }

  return { focused: true, relatedNames };
}

function familyMemberClass(dynastyId, member = {}) {
  const focusState = getFocusedFamilyTreeState(dynastyId);
  if (!focusState.focused) {
    return {};
  }

  const isSelected = focusedFamilyMemberKey.value === `${dynastyId}::${member.name}`;
  const isRelated = focusState.relatedNames.has(member.name);
  return {
    "family-member-selected": isSelected,
    "family-member-related": !isSelected && isRelated,
    "family-member-muted": !isRelated,
  };
}

function familyTreeCardClass(dynastyId) {
  if (!focusedFamilyMemberKey.value) {
    return {};
  }

  const [focusedDynastyId] = focusedFamilyMemberKey.value.split("::");
  return {
    "dynasty-card-focused": focusedDynastyId === dynastyId,
    "dynasty-card-muted": focusedDynastyId !== dynastyId,
  };
}

function familyTreeLinkClass(dynastyId, link = {}) {
  const focusState = getFocusedFamilyTreeState(dynastyId);
  if (!focusState.focused) {
    return {};
  }

  const isRelated = focusState.relatedNames.has(link.parent) || focusState.relatedNames.has(link.child);
  return {
    "tree-link-selected": isRelated,
    "tree-link-muted": !isRelated,
  };
}

function relationGlyph(type = "parent-child") {
  if (type === "marriage") return "↔";
  if (type === "sibling") return "⇄";
  if (type === "rivalry") return "⚔";
  return "↳";
}

function formatTreeLink(link = {}) {
  return `${link.parent || "Unknown"} ${relationGlyph(link.type)} ${link.child || "Unknown"}`;
}

async function saveHistoryRecord() {
  if (!history.value) {
    toastService.error("Generate history before saving it.");
    return;
  }

  const systemId = String(route.query.systemId || route.query.systemRecordId || "").trim();
  const persisted = await historyStore.saveHistory({
    ...history.value,
    civilizationName: history.value.civilizationName || civName.value,
    context: { ...historyContext.value },
    systemId,
    worldName: historyContext.value.worldName,
    worldKey: [systemId, historyContext.value.worldName].filter(Boolean).join(":"),
    meta: {
      ...(history.value.meta || {}),
      historyLength: historyLength.value,
      eraStart: Number(eraStart.value || 5000),
      seed: String(historySeed.value || "").trim(),
    },
  });

  history.value = persisted;
  toastService.success(`Saved history for ${persisted.civilizationName}.`);
}

function loadSavedHistory(record = {}) {
  history.value = { ...record };
  civName.value = String(record.civilizationName || civName.value || "");
  historyLength.value = String(record?.meta?.historyLength || historyLength.value || "medium");
  historySeed.value = String(record?.meta?.seed || historySeed.value || "").trim();
  eraStart.value = Number(record?.meta?.eraStart || eraStart.value || 5000);
  toastService.success(`Loaded saved history for ${record.civilizationName || "the archive"}.`);
}

async function deleteSavedHistory(recordId) {
  await historyStore.removeHistory(recordId);
  if (history.value?.id === recordId) {
    history.value = null;
  }
  toastService.info("Saved history deleted.");
}

function evolveHistory() {
  if (!history.value) {
    toastService.error("Generate history before evolving it.");
    return;
  }

  const nextSpan = Math.min(
    13000000000,
    Math.max(Number(eraStart.value || 5000), Number(history.value?.meta?.eraStart || 0)) +
      Math.max(1000, Math.floor(Number(eraStart.value || 5000) * 0.35)),
  );

  eraStart.value = nextSpan;
  historyLength.value = historyLength.value === "short" ? "medium" : "long";
  history.value = generateProceduralHistory({
    civilizationName: history.value?.civilizationName || civName.value || pick(CIV_PREFIXES) + pick(CIV_SUFFIXES),
    historyLength: historyLength.value,
    eraStart: nextSpan,
    rng: resolveHistoryRng(
      history.value?.civilizationName || civName.value || "Generated Civilization",
      historyLength.value,
      nextSpan,
    ),
    context: {
      ...historyContext.value,
      flashpoint: history.value?.dynasties?.[0]?.inheritanceCrisis || historyContext.value.flashpoint,
      conflictSummary:
        history.value?.dynasties
          ?.map((dynasty) => dynasty.feudSummary)
          .filter(Boolean)
          .slice(0, 2)
          .join(" ") || historyContext.value.conflictSummary,
      eventHook: history.value?.dynasties?.[0]?.successionWar || historyContext.value.eventHook,
    },
  });
  toastService.success("The timeline has evolved into a new dynastic phase.");
}

async function exportHistory() {
  if (!history.value) return;
  await exportHistoryArchive({
    data: history,
    filename: (historyRecord) => `${historyRecord.civilizationName.replace(/\s+/g, "-")}-History.json`,
    serializeMessage: "Serializing historical archive...",
    encodeMessage: "Encoding history archive for transfer...",
    readyMessage: "History archive staged for local transfer.",
  });
}

onMounted(async () => {
  await historyStore.hydrateHistories({
    systemId: String(route.query.systemId || route.query.systemRecordId || "").trim(),
    worldName: historyContext.value.worldName,
    worldKey: [String(route.query.systemId || route.query.systemRecordId || "").trim(), historyContext.value.worldName]
      .filter(Boolean)
      .join(":"),
  });

  if (String(civName.value || "").trim()) {
    generateHistory();
  }
});

watch([timelineViewMode, timelineEraFilter, focusedFamilyMemberKey], () => {
  syncTimelineQueryState();
});

watch(timelineEraOptions, (options) => {
  if (timelineEraFilter.value !== "all" && !options.includes(timelineEraFilter.value)) {
    timelineEraFilter.value = "all";
  }
});

watch([() => history.value?.familyTree, focusedFamilyMember], ([familyTree, focusedMember]) => {
  if (Array.isArray(familyTree) && familyTree.length && focusedFamilyMemberKey.value && !focusedMember) {
    focusedFamilyMemberKey.value = "";
  }
});
</script>

<style scoped>
.history-generator {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  height: calc(100vh - 60px);
}

.survey-content {
  padding: 1.25rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.control-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1.15rem;
  background: #1a1a1a;
  border-radius: 0.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}
.control-group label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.9rem;
}
.control-action {
  justify-content: flex-end;
}
.action-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.name-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}
.name-row .text-input {
  flex: 1;
}

.select-input,
.text-input {
  min-height: 2.5rem;
  padding: 0.6rem 0.75rem;
  background: #2a2a3e;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.btn {
  min-height: 2.5rem;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  line-height: 1.2;
  transition: all 0.2s;
}
.btn-primary {
  background: #00d9ff;
  color: #000;
}
.btn-primary:hover {
  background: #00ffff;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.4);
}
.btn-secondary {
  background: #444;
  color: #e0e0e0;
}
.btn-secondary:hover {
  background: #555;
}

.history-seed-panel,
.history-category-panel,
.saved-history-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.seed-card {
  background: #1a1a2e;
  border: 1px solid rgba(0, 217, 255, 0.35);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.seed-card-label {
  color: #8fdcff;
  font-size: 0.78rem;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}

.seed-card-value {
  color: #f5f7ff;
  font-weight: 600;
}

.category-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.12);
  border: 1px solid rgba(0, 217, 255, 0.2);
  color: #d7f6ff;
  font-size: 0.78rem;
}

.history-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.15rem;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
  flex-wrap: wrap;
}

.history-header h2 {
  color: #00d9ff;
  margin: 0;
}
.history-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.meta-badge {
  background: rgba(0, 217, 255, 0.12);
  color: #00ffff;
  padding: 0.3rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
}

.key-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.kstat {
  background: #12122e;
  border-radius: 0.4rem;
  padding: 0.75rem 1rem;
}

.kstat-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.kstat-value {
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: bold;
}

.notable-people-panel,
.family-tree-panel {
  margin-bottom: 1.5rem;
}

.people-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}

.people-panel-header h3 {
  margin: 0;
  color: #8fdcff;
}

.family-tree-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.family-clear-button {
  min-height: 2rem;
  padding: 0.35rem 0.75rem;
}

.family-focus-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.85rem;
  padding: 0.7rem 0.85rem;
  border-radius: 0.5rem;
  background: rgba(0, 217, 255, 0.12);
  border: 1px solid rgba(0, 217, 255, 0.28);
  color: #eafcff;
}

.saved-history-list,
.people-grid,
.dynasty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.saved-history-card,
.person-card,
.dynasty-card {
  background: #12122e;
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.85rem;
}

.dynasty-card-focused {
  border-color: rgba(0, 217, 255, 0.65);
  box-shadow:
    0 0 0 1px rgba(0, 217, 255, 0.14),
    0 12px 28px rgba(0, 0, 0, 0.32);
}

.dynasty-card-muted {
  opacity: 0.46;
}

.person-name {
  color: #fff;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.person-role {
  color: #8fdcff;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}

.person-dynasty {
  color: #c2e8ff;
  font-size: 0.78rem;
  margin-bottom: 0.45rem;
}

.person-summary {
  color: #c9d6f2;
  font-size: 0.84rem;
  line-height: 1.45;
  margin-bottom: 0.7rem;
}

.person-kinship,
.dynasty-crisis {
  color: #dfe9ff;
  font-size: 0.8rem;
  line-height: 1.45;
  margin-bottom: 0.6rem;
}

.dynasty-crisis {
  color: #ffd4a8;
}

.saved-history-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dynasty-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  list-style: none;
  margin-bottom: 0.6rem;
}

.dynasty-summary-row::-webkit-details-marker {
  display: none;
}

.tree-link-map {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.tree-link-row {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  font-size: 0.74rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.tree-link-row.link-parent-child {
  background: rgba(0, 217, 255, 0.12);
  color: #c9f5ff;
}

.tree-link-row.link-marriage {
  background: rgba(102, 255, 153, 0.14);
  color: #d8ffe7;
}

.tree-link-row.link-sibling {
  background: rgba(255, 214, 102, 0.16);
  color: #fff2c9;
}

.tree-link-row.link-rivalry {
  background: rgba(255, 107, 107, 0.16);
  color: #ffd1d1;
}

.tree-link-selected {
  border-color: rgba(0, 217, 255, 0.45);
}

.tree-link-muted {
  opacity: 0.28;
}

.generation-board {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.generation-lane {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 0.55rem;
  align-items: start;
}

.generation-lane-label {
  color: #00ffff;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding-top: 0.3rem;
}

.generation-lane-members {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.generation-member {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 130px;
  padding: 0.32rem 0.5rem;
  border-radius: 0.35rem;
  background: rgba(0, 217, 255, 0.08);
  border: 1px solid rgba(0, 217, 255, 0.16);
  color: #dfe9ff;
  font-size: 0.75rem;
}

.generation-member.family-member-selected,
.lineage-row.family-member-selected {
  background: rgba(0, 217, 255, 0.18);
  border-color: rgba(0, 217, 255, 0.72);
  box-shadow: 0 0 0 1px rgba(0, 217, 255, 0.18);
}

.generation-member.family-member-related,
.lineage-row.family-member-related {
  background: rgba(0, 217, 255, 0.12);
  border-color: rgba(0, 217, 255, 0.28);
}

.generation-member.family-member-muted,
.lineage-row.family-member-muted {
  opacity: 0.35;
}

.generation-member[role="button"],
.lineage-copy[role="button"] {
  cursor: pointer;
}

.generation-member[role="button"]:focus-visible,
.lineage-copy[role="button"]:focus-visible,
.family-clear-button:focus-visible {
  outline: 2px solid #00ffff;
  outline-offset: 2px;
}

.person-life-list,
.lineage-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.person-life-row {
  display: grid;
  grid-template-columns: 60px 120px 1fr;
  gap: 0.45rem;
  align-items: start;
  font-size: 0.78rem;
}

.person-life-type {
  color: #00ffff;
  font-weight: 700;
}

.person-life-date {
  color: #9fb4d9;
  font-family: monospace;
}

.person-life-label {
  color: #dfe9ff;
}

.lineage-row {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 0.6rem;
  align-items: start;
  padding: 0.45rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.lineage-row:first-child {
  border-top: none;
}

.lineage-generation {
  color: #00ffff;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
}

.lineage-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  color: #dfe9ff;
  font-size: 0.8rem;
}

.timeline-panel {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.timeline-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.timeline-view-header h3 {
  margin: 0;
  color: #8fdcff;
}

.timeline-view-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.timeline-era-filter-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.timeline-era-filter-label {
  color: #b5d8ff;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.timeline-era-chip-list {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.timeline-era-chip {
  min-height: 2rem;
  border-radius: 999px;
  border: 1px solid rgba(110, 189, 255, 0.35);
  background: rgba(14, 21, 42, 0.88);
  color: #d7eaff;
  padding: 0.2rem 0.6rem;
  font-size: 0.78rem;
  line-height: 1;
  cursor: pointer;
}

.timeline-era-chip:hover {
  border-color: rgba(0, 217, 255, 0.45);
}

.timeline-era-chip-active {
  background: rgba(0, 217, 255, 0.2);
  color: #e8fdff;
  border-color: rgba(0, 217, 255, 0.6);
}

.timeline-era-chip:focus-visible {
  outline: 2px solid rgba(0, 217, 255, 0.55);
  outline-offset: 1px;
}

.timeline-view-toggle {
  display: inline-flex;
  gap: 0.45rem;
}

.timeline-toggle-btn {
  min-height: 2rem;
  padding: 0.35rem 0.75rem;
}

.timeline-toggle-active {
  background: rgba(0, 217, 255, 0.22);
  color: #dff8ff;
  border: 1px solid rgba(0, 217, 255, 0.45);
}

.timeline-track {
  position: relative;
  min-height: 130px;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 217, 255, 0.22);
  background: linear-gradient(180deg, rgba(12, 22, 44, 0.55), rgba(10, 14, 30, 0.7));
  padding: 0.8rem 1rem 0.9rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.timeline-empty-state {
  color: #9eb8da;
  font-size: 0.86rem;
  letter-spacing: 0.01em;
}

.timeline-track-lane {
  position: relative;
  min-height: 112px;
  border-radius: 0.45rem;
  background: rgba(8, 12, 25, 0.42);
  border: 1px solid rgba(0, 217, 255, 0.12);
  padding: 0.65rem 0.6rem 0.55rem;
}

.timeline-track-lane-label {
  position: absolute;
  top: 0.25rem;
  left: 0.5rem;
  z-index: 2;
  color: #92ddff;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(6, 14, 30, 0.92);
  border: 1px solid rgba(0, 217, 255, 0.22);
  border-radius: 999px;
  padding: 0.16rem 0.45rem;
}

.timeline-track-axis {
  position: absolute;
  top: 52%;
  left: 0.6rem;
  right: 0.6rem;
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 217, 255, 0.25), rgba(0, 217, 255, 0.75), rgba(0, 217, 255, 0.25));
}

.timeline-track-node {
  position: absolute;
  top: 52%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.timeline-track-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid #0d1226;
  background: #00d9ff;
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.15);
}

.timeline-track-card {
  width: 168px;
  min-height: 66px;
  background: rgba(8, 15, 32, 0.92);
  border: 1px solid rgba(0, 217, 255, 0.22);
  border-radius: 0.5rem;
  padding: 0.4rem 0.5rem;
}

.timeline-track-node-top .timeline-track-card {
  transform: translateY(-46px);
}

.timeline-track-node-bottom .timeline-track-card {
  transform: translateY(46px);
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-event {
  display: grid;
  grid-template-columns: 165px 24px 1fr;
  gap: 0 1rem;
  align-items: start;
  min-height: 60px;
}

.event-year {
  text-align: right;
  padding-top: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
}

.event-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connector-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00d9ff;
  border: 2px solid #0a0a1a;
  flex-shrink: 0;
  margin-top: 5px;
}

.connector-line {
  flex: 1;
  width: 2px;
  background: #333;
  margin-top: 2px;
}

.timeline-event:last-child .connector-line {
  display: none;
}

.event-content {
  padding-bottom: 1.5rem;
}

.event-category {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin-bottom: 0.2rem;
}

.event-title {
  color: #fff;
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.event-description {
  color: #bbb;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 0.4rem;
}

.event-cause {
  color: #ffd9a0;
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.event-consequence {
  color: #00d9ff;
  font-size: 0.8rem;
  font-style: italic;
}

/* Category accent colours on the dot */
.timeline-event.political .connector-dot {
  background: #9b59b6;
}
.timeline-event.military .connector-dot {
  background: #e74c3c;
}
.timeline-event.economic .connector-dot {
  background: #f1c40f;
}
.timeline-event.technological .connector-dot {
  background: #00d9ff;
}
.timeline-event.cultural .connector-dot {
  background: #1abc9c;
}
.timeline-event.natural-disaster .connector-dot {
  background: #e67e22;
}
.timeline-event.first-contact .connector-dot {
  background: #8e44ad;
}
.timeline-event.exploration .connector-dot {
  background: #2ecc71;
}
.timeline-event.religious .connector-dot {
  background: #d4ac0d;
}
.timeline-event.collapse .connector-dot {
  background: #7f8c8d;
}
</style>

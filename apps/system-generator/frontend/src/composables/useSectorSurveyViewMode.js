import { computed } from "vue";
import { normalizeSubsectorLetter } from "../utils/subsector.js";

export function getRequestedSurveyViewport(route) {
  const requestedScope = String(route?.query?.viewScope || "")
    .trim()
    .toLowerCase();
  const requestedSubsectorName = String(route?.query?.subsectorName || "").trim();

  return {
    scope: requestedScope === "subsector" ? "subsector" : requestedScope === "sector" ? "sector" : null,
    subsector: route?.query?.subsector ? normalizeSubsectorLetter(route.query.subsector, null) : null,
    subsectorName: requestedSubsectorName || null,
  };
}

export function useSectorSurveyViewMode({ props, route, router, selectedSectorId, selectedSubsector, subsectorName }) {
  const currentViewMode = computed(() => (props.viewMode === "subsector" ? "subsector" : "sector"));
  const currentSurveyRouteName = computed(() =>
    currentViewMode.value === "subsector" ? "SubsectorSurvey" : "SectorSurvey",
  );
  const surveyPageLabel = computed(() =>
    currentViewMode.value === "subsector" ? "Subsector Survey" : "Sector Survey",
  );

  function switchSurveyPage(viewMode, galaxyId) {
    const targetView = viewMode === "subsector" ? "subsector" : "sector";
    if (targetView === currentViewMode.value) {
      return;
    }

    router.push({
      name: targetView === "subsector" ? "SubsectorSurvey" : "SectorSurvey",
      params: { galaxyId: galaxyId ?? props.galaxyId ?? "000" },
      query: {
        ...route.query,
        ...(selectedSectorId.value ? { sectorId: selectedSectorId.value } : {}),
        viewScope: targetView,
        subsector: selectedSubsector.value || undefined,
        subsectorName: String(subsectorName.value || "").trim() || undefined,
      },
    });
  }

  return {
    currentViewMode,
    currentSurveyRouteName,
    surveyPageLabel,
    switchSurveyPage,
  };
}

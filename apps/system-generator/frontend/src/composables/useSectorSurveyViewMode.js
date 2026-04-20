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

export function useSectorSurveyViewMode({
  props,
  route,
  router,
  scope,
  selectedSectorId,
  selectedSubsector,
  subsectorName,
}) {
  const currentViewMode = computed(() => (props.viewMode === "subsector" ? "subsector" : "sector"));
  const currentSurveyRouteName = computed(() =>
    currentViewMode.value === "subsector" ? "SubsectorSurvey" : "SectorSurvey",
  );
  const surveyPageLabel = computed(() =>
    currentViewMode.value === "subsector" ? "Subsector Survey" : "Sector Survey",
  );

  function switchSurveyPage(viewMode, galaxyId) {
    const targetView = viewMode === "subsector" ? "subsector" : "sector";
    const routeName = targetView === "subsector" ? "SubsectorSurvey" : "SectorSurvey";
    const nextQuery = {
      ...route.query,
      ...(selectedSectorId.value ? { sectorId: selectedSectorId.value } : {}),
      viewScope: targetView,
    };

    if (targetView === "subsector") {
      nextQuery.subsector = selectedSubsector.value || undefined;
      nextQuery.subsectorName = String(subsectorName.value || "").trim() || undefined;
    } else {
      delete nextQuery.subsector;
      delete nextQuery.subsectorName;
    }

    if (scope?.value !== targetView) {
      scope.value = targetView;
    }

    const nextRoute = {
      name: routeName,
      params: { galaxyId: galaxyId ?? props.galaxyId ?? "000" },
      query: nextQuery,
    };

    if (targetView === currentViewMode.value) {
      router.replace(nextRoute);
      return;
    }

    router.push(nextRoute);
  }

  return {
    currentViewMode,
    currentSurveyRouteName,
    surveyPageLabel,
    switchSurveyPage,
  };
}

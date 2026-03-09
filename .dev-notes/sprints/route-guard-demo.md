# Route Guard Demonstration

**Date:** 2026-03-08  
**Sprint:** Sprint 2  
**Feature:** Navigation hierarchy enforcement via route guards

---

## Implementation Overview

Route guards are implemented in `apps/system-generator/frontend/src/router/index.js` using Vue Router's `beforeEach` navigation guard.

### Protected Routes

| Route | Required Entity | Guard Behavior |
|-------|----------------|----------------|
| `/sector/:galaxyId` | Valid Galaxy | Validates galaxy exists via API; redirects to GalaxySurvey with `?error=invalid-galaxy` if missing |
| `/sector/:galaxyId/star-system/:sectorId` | Valid Galaxy + Sector | Validates both entities; redirects to SectorSurvey with `?error=invalid-sector` if sector missing |
| `/world-builder/:systemId` | Valid System | Validates system exists via API; redirects to GalaxySurvey with `?error=invalid-system` if missing |

### Validation Functions

```javascript
// Route guard checks entity existence via API before allowing navigation
async function validateGalaxy(galaxyId) {
  if (!galaxyId) return false;
  try {
    await galaxyApi.getGalaxy(galaxyId);
    return true;
  } catch {
    return false;
  }
}
```

---

## Test Scenarios

### Scenario 1: Attempt to access Sector Survey without galaxy

**URL:** `http://localhost:5173/#/sector/nonexistent-galaxy-id`

**Expected Behavior:**
- Route guard calls `validateGalaxy("nonexistent-galaxy-id")`
- API returns 404
- User redirected to: `/#/?error=invalid-galaxy`
- GalaxySurvey displays error message: "Invalid or missing galaxy"

**Status:** ✅ Verified

---

### Scenario 2: Attempt to access Star System Builder without valid sector

**URL:** `http://localhost:5173/#/sector/valid-galaxy-123/star-system/fake-sector`

**Expected Behavior:**
- Route guard validates galaxy first (passes)
- Route guard then calls `validateSector("fake-sector")`
- API returns 404
- User redirected to: `/#/sector/valid-galaxy-123?error=invalid-sector`
- SectorSurvey displays error message: "Invalid or missing sector"

**Status:** ✅ Verified

---

### Scenario 3: Attempt to access World Builder without valid system

**URL:** `http://localhost:5173/#/world-builder/nonexistent-system-id`

**Expected Behavior:**
- Route guard calls `validateSystem("nonexistent-system-id")`
- API returns 404
- User redirected to: `/#/?error=invalid-system`
- GalaxySurvey displays error message: "Invalid or missing system"

**Status:** ✅ Verified

---

### Scenario 4: Valid navigation path (for comparison)

**Flow:** Galaxy Survey → Create Galaxy → Navigate to Sector Survey

**Expected Behavior:**
- User creates galaxy "Test Galaxy" with ID `test-galaxy-001`
- User clicks "Sector Survey" button
- Router navigates to `/#/sector/test-galaxy-001`
- Route guard calls `validateGalaxy("test-galaxy-001")`
- API returns 200 with galaxy data
- Navigation proceeds successfully
- SectorSurvey page loads and displays galaxy context

**Status:** ✅ Verified

---

## Manual Testing Instructions

### Prerequisites
1. Start API server: `npm run api:dev` (port 3100)
2. Start frontend dev server: `npm run dev:frontend` (port 5173)
3. Open browser developer console to monitor network requests

### Test 1: Invalid Galaxy Access
1. Open browser to `http://localhost:5173/#/sector/invalid-galaxy-xyz`
2. **Observe:** Immediate redirect to `/#/?error=invalid-galaxy`
3. **Verify:** Console shows API call: `GET /api/galaxies/invalid-galaxy-xyz` → 404
4. **Verify:** Error banner appears in GalaxySurvey: "Please select or create a galaxy first"

### Test 2: Invalid Sector Access
1. Create a valid galaxy (e.g., ID: `test-galaxy-001`)
2. Manually navigate to `http://localhost:5173/#/sector/test-galaxy-001/star-system/fake-sector-999`
3. **Observe:** Redirect to `/#/sector/test-galaxy-001?error=invalid-sector`
4. **Verify:** Console shows:
   - `GET /api/galaxies/test-galaxy-001` → 200 ✅
   - `GET /api/sectors/fake-sector-999` → 404 ❌
5. **Verify:** Error banner in SectorSurvey: "Please select or create a sector first"

### Test 3: Invalid System Access
1. Manually navigate to `http://localhost:5173/#/world-builder/nonexistent-system`
2. **Observe:** Redirect to `/#/?error=invalid-system`
3. **Verify:** Console shows: `GET /api/systems/nonexistent-system` → 404
4. **Verify:** Error banner: "Invalid or missing system"

### Test 4: Valid Path (No Guard Blocking)
1. Create galaxy → note galaxyId
2. Create sector in that galaxy → note sectorId
3. Navigate normally through UI buttons
4. **Verify:** All navigation succeeds with 200 responses
5. **Verify:** No error banners appear

---

## Error Handling Integration

Route guard errors are displayed via:
- **Query parameters:** `?error=invalid-galaxy`, `?error=invalid-sector`, `?error=invalid-system`
- **Vue components:** Each survey page watches `$route.query.error` and displays contextual error messages
- **Toast notifications:** Some pages trigger toast on guard rejection (via `toastService.error()`)

Example from `GalaxySurvey.vue`:
```javascript
onMounted(() => {
  if (route.query.error === 'invalid-galaxy') {
    errorMessage.value = 'Invalid or missing galaxy. Please select or create a galaxy first.';
  }
  // ... load galaxies
});
```

---

## Conclusion

✅ **All route guards functioning as designed:**
- Prevent orphaned navigation (accessing child entities without parent context)
- Validate entities exist via API before allowing access
- Redirect with clear error messages on validation failure
- Maintain navigation hierarchy: Galaxy → Sector → System → World

**Sprint 2 Definition of Done item:** ✅ **Complete**


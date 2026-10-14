const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.endsWith('?raw') ? name.slice(0, -4) : name, ...args);
};
require.extensions['.md'] = (module, filename) => { module.exports = fs.readFileSync(filename, 'utf8'); };
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const { godotPrologue, godotLockerScene, godotPostMatchScene, godotStoryScene, godotVnAudio } = require('../tests/fixtures/godotPrologue.ts');
const prologue = godotPrologue();
fs.writeFileSync(path.join(root, 'godot/data/prologue.json'), `${JSON.stringify(prologue, null, 2)}\n`);
const lockerScene = godotLockerScene();
fs.writeFileSync(path.join(root, 'godot/data/locker_scene.json'), `${JSON.stringify(lockerScene, null, 2)}\n`);
const postMatchScene = godotPostMatchScene();
fs.writeFileSync(path.join(root, 'godot/data/post_match_scene.json'), `${JSON.stringify(postMatchScene, null, 2)}\n`);
const photoScene = godotStoryScene(3);
fs.writeFileSync(path.join(root, 'godot/data/photo_scene.json'), `${JSON.stringify(photoScene, null, 2)}\n`);
const postPhotoScene = godotStoryScene(4);
fs.writeFileSync(path.join(root, 'godot/data/post_photo_scene.json'), `${JSON.stringify(postPhotoScene, null, 2)}\n`);
const poolScene = godotStoryScene(5);
fs.writeFileSync(path.join(root, 'godot/data/pool_scene.json'), `${JSON.stringify(poolScene, null, 2)}\n`);
const postPoolScene = godotStoryScene(6);
fs.writeFileSync(path.join(root, 'godot/data/post_pool_scene.json'), `${JSON.stringify(postPoolScene, null, 2)}\n`);
const orderedInspectionScene = godotStoryScene(7);
fs.writeFileSync(path.join(root, 'godot/data/ordered_inspection_scene.json'), `${JSON.stringify(orderedInspectionScene, null, 2)}\n`);
const postOrderedInspectionScene = godotStoryScene(8);
fs.writeFileSync(path.join(root, 'godot/data/post_ordered_inspection_scene.json'), `${JSON.stringify(postOrderedInspectionScene, null, 2)}\n`);
const emergencyMeetingScene = godotStoryScene(9);
fs.writeFileSync(path.join(root, 'godot/data/emergency_meeting_scene.json'), `${JSON.stringify(emergencyMeetingScene, null, 2)}\n`);
const postEmergencyMeetingScene = godotStoryScene(10);
fs.writeFileSync(path.join(root, 'godot/data/post_emergency_meeting_scene.json'), `${JSON.stringify(postEmergencyMeetingScene, null, 2)}\n`);
const basketballLockersScene = godotStoryScene(11);
fs.writeFileSync(path.join(root, 'godot/data/basketball_lockers_scene.json'), `${JSON.stringify(basketballLockersScene, null, 2)}\n`);
const postBasketballLockersScene = godotStoryScene(12);
fs.writeFileSync(path.join(root, 'godot/data/post_basketball_lockers_scene.json'), `${JSON.stringify(postBasketballLockersScene, null, 2)}\n`);
const textileWorkshopScene = godotStoryScene(13);
fs.writeFileSync(path.join(root, 'godot/data/textile_workshop_scene.json'), `${JSON.stringify(textileWorkshopScene, null, 2)}\n`);
const postTextileWorkshopScene = godotStoryScene(14);
fs.writeFileSync(path.join(root, 'godot/data/post_textile_workshop_scene.json'), `${JSON.stringify(postTextileWorkshopScene, null, 2)}\n`);
const asterionLabScene = godotStoryScene(15);
fs.writeFileSync(path.join(root, 'godot/data/asterion_lab_scene.json'), `${JSON.stringify(asterionLabScene, null, 2)}\n`);
const postAsterionLabScene = godotStoryScene(16);
fs.writeFileSync(path.join(root, 'godot/data/post_asterion_lab_scene.json'), `${JSON.stringify(postAsterionLabScene, null, 2)}\n`);
const lostFoundScene = godotStoryScene(17);
fs.writeFileSync(path.join(root, 'godot/data/lost_found_scene.json'), `${JSON.stringify(lostFoundScene, null, 2)}\n`);
const postLostFoundScene = godotStoryScene(18);
fs.writeFileSync(path.join(root, 'godot/data/post_lost_found_scene.json'), `${JSON.stringify(postLostFoundScene, null, 2)}\n`);
const maintenanceKeysScene = godotStoryScene(19);
fs.writeFileSync(path.join(root, 'godot/data/maintenance_keys_scene.json'), `${JSON.stringify(maintenanceKeysScene, null, 2)}\n`);
const postMaintenanceKeysScene = godotStoryScene(20);
fs.writeFileSync(path.join(root, 'godot/data/post_maintenance_keys_scene.json'), `${JSON.stringify(postMaintenanceKeysScene, null, 2)}\n`);
const controlSampleGearScene = godotStoryScene(21);
fs.writeFileSync(path.join(root, 'godot/data/control_sample_gear_scene.json'), `${JSON.stringify(controlSampleGearScene, null, 2)}\n`);
const postControlSampleGearScene = godotStoryScene(22);
fs.writeFileSync(path.join(root, 'godot/data/post_control_sample_gear_scene.json'), `${JSON.stringify(postControlSampleGearScene, null, 2)}\n`);
const asterionTransferScene = godotStoryScene(23);
fs.writeFileSync(path.join(root, 'godot/data/asterion_transfer_scene.json'), `${JSON.stringify(asterionTransferScene, null, 2)}\n`);
const postAsterionTransferScene = godotStoryScene(24);
fs.writeFileSync(path.join(root, 'godot/data/post_asterion_transfer_scene.json'), `${JSON.stringify(postAsterionTransferScene, null, 2)}\n`);
const secondSkinSignalScene = godotStoryScene(25);
fs.writeFileSync(path.join(root, 'godot/data/second_skin_signal_scene.json'), `${JSON.stringify(secondSkinSignalScene, null, 2)}\n`);
const postSecondSkinSignalScene = godotStoryScene(26);
fs.writeFileSync(path.join(root, 'godot/data/post_second_skin_signal_scene.json'), `${JSON.stringify(postSecondSkinSignalScene, null, 2)}\n`);
const kendoPilotListScene = godotStoryScene(27);
fs.writeFileSync(path.join(root, 'godot/data/kendo_pilot_list_scene.json'), `${JSON.stringify(kendoPilotListScene, null, 2)}\n`);
const postKendoPilotListScene = godotStoryScene(28);
fs.writeFileSync(path.join(root, 'godot/data/post_kendo_pilot_list_scene.json'), `${JSON.stringify(postKendoPilotListScene, null, 2)}\n`);
const kuboAtelierScene = godotStoryScene(29);
fs.writeFileSync(path.join(root, 'godot/data/kubo_atelier_scene.json'), `${JSON.stringify(kuboAtelierScene, null, 2)}\n`);
const postKuboAtelierScene = godotStoryScene(30);
fs.writeFileSync(path.join(root, 'godot/data/post_kubo_atelier_scene.json'), `${JSON.stringify(postKuboAtelierScene, null, 2)}\n`);
const abandonedLaundryScene = godotStoryScene(31);
fs.writeFileSync(path.join(root, 'godot/data/abandoned_laundry_scene.json'), `${JSON.stringify(abandonedLaundryScene, null, 2)}\n`);
const postAbandonedLaundryScene = godotStoryScene(32);
fs.writeFileSync(path.join(root, 'godot/data/post_abandoned_laundry_scene.json'), `${JSON.stringify(postAbandonedLaundryScene, null, 2)}\n`);
const pinkRibbonScannerScene = godotStoryScene(33);
fs.writeFileSync(path.join(root, 'godot/data/pink_ribbon_scanner_scene.json'), `${JSON.stringify(pinkRibbonScannerScene, null, 2)}\n`);
const postPinkRibbonScannerScene = godotStoryScene(34);
fs.writeFileSync(path.join(root, 'godot/data/post_pink_ribbon_scanner_scene.json'), `${JSON.stringify(postPinkRibbonScannerScene, null, 2)}\n`);
const rinaArchiveCatalogScene = godotStoryScene(35);
fs.writeFileSync(path.join(root, 'godot/data/rina_archive_catalog_scene.json'), `${JSON.stringify(rinaArchiveCatalogScene, null, 2)}\n`);
const postRinaArchiveCatalogScene = godotStoryScene(36);
fs.writeFileSync(path.join(root, 'godot/data/post_rina_archive_catalog_scene.json'), `${JSON.stringify(postRinaArchiveCatalogScene, null, 2)}\n`);
const audioPath = path.join(root, 'godot/data/menu_audio.json');
const audio = JSON.parse(fs.readFileSync(audioPath, 'utf8'));
fs.writeFileSync(audioPath, `${JSON.stringify({ ...audio, ...godotVnAudio() }, null, 2)}\n`);
const assets = new Set([prologue.background, ...prologue.lines.flatMap((line) => line.actors.map((actor) => actor.asset))]);
for (const line of postMatchScene.lines) {
  assets.add(line.background);
  for (const actor of line.actors) assets.add(actor.asset);
}
for (const scene of [photoScene, postPhotoScene, poolScene, postPoolScene, orderedInspectionScene, postOrderedInspectionScene, emergencyMeetingScene, postEmergencyMeetingScene, basketballLockersScene, postBasketballLockersScene, textileWorkshopScene, postTextileWorkshopScene, asterionLabScene, postAsterionLabScene, lostFoundScene, postLostFoundScene, maintenanceKeysScene, postMaintenanceKeysScene, controlSampleGearScene, postControlSampleGearScene, asterionTransferScene, postAsterionTransferScene, secondSkinSignalScene, postSecondSkinSignalScene, kendoPilotListScene, postKendoPilotListScene, kuboAtelierScene, postKuboAtelierScene, abandonedLaundryScene, postAbandonedLaundryScene, pinkRibbonScannerScene, postPinkRibbonScannerScene, rinaArchiveCatalogScene, postRinaArchiveCatalogScene]) {
  assets.add(scene.background);
  for (const line of scene.lines) {
    assets.add(line.background);
    for (const actor of line.actors) assets.add(actor.asset);
  }
}
for (const lines of Object.values(lockerScene.variants)) {
  for (const line of lines) {
    assets.add(line.background);
    for (const actor of line.actors) assets.add(actor.asset);
  }
}
for (const asset of assets) {
  if (!asset.startsWith('./assets/') || asset.includes('..')) throw new Error(`Unexpected asset: ${asset}`);
  const target = path.join(root, 'godot', asset);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, 'public', asset), target);
}
console.log(`Exported Godot story scene data through scene 36, 3 locales, and ${assets.size} original assets.`);

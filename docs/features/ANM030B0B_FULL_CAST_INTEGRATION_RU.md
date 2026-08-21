# ANM-030B0B R1.1 / ANM-030B0C — Full Cast Production Integration

Status: **R1 merged as PR #186; R1.1 corrective archive adoption requires GitHub CI + iPhone visual QA**.
Baseline: `main` commit `227d32ca7e0ab681cf20919ac36bbc9a2860eac1`.

## R1.1 corrective archive adoption

PR #186 correctly integrated the full nine-character runtime routing and added the 35 assets for
Kentaro, Norihiro, Mayu, Rina and Kurose, but unintentionally retained the previous 28 binaries for
Miku, Onoe, Ayuki and Emi. ANM-030B0C replaces those four complete seven-asset packages with the
files from `all-characters-first-preprod-run.zip`.

The replacement keeps the same canonical paths and `1024×1536`/medallion dimensions. Its measured
alpha geometry and eye lines differ from the retained binaries, so ANM-030B0C refreshes the
canonical manifest and Scene Studio guides while leaving runtime routing and staging scale intact.
The source archive SHA-256 is
`94fde58caa2afa58e742349ba83bf7aaa0a23e1a9ddc4c3595e94cfc5354b637`; an automated combined digest
now locks all 63 runtime assets and prevents a partial archive import from passing CI again.

## Цель

Интегрировать первый полный external preproduction run основного full-stage cast и закрыть прежнюю
смесь production rigs, planned placeholders и временного Emi candidate override.

После этой фичи все девять core/recurring stage-персонажей находятся в
`upds-character-production-v2` и имеют одинаковый обязательный runtime package:

- Miku;
- Onoe;
- Ayuki;
- Emi;
- Kentaro;
- Norihiro;
- Mayu;
- Rina;
- Kurose.

Guest/witness packages и extras не входят в этот список и сохраняют отдельные production contracts.

## Импортированный package

На каждого персонажа поставляется ровно семь runtime assets:

1. пять precomposed Pose A frames: `neutral`, `smile`, `serious`, `surprised`, `embarrassed`;
2. один character-specific Pose B;
3. один neutral medallion.

Все Pose A/Pose B PNG имеют canvas `1024×1536`; medallions квадратные `256×256`, кроме утверждённого
Emi `512×512`. В пределах каждого Pose A rig пять frames сохраняют общий canvas/pivot и visual
height с допуском 1 px; отдельные волосы/жесты могут расширять expression-specific alpha bounds.

## Runtime resolution

- `productionCharacterKeys` содержит все девять персонажей;
- `plannedCharacterKeys` и full-stage placeholder catalog пусты;
- `characterForSpeaker()` направляет Kentaro/Norihiro/Mayu/Rina/Kurose в реальные rigs;
- встроенный Emi D0–D3 override удалён: `expressionAsset()` возвращает canonical
  `emi/rig/pose_a/frames/*`;
- browser-local Composition overrides/calibration остаются доступны и не меняют canonical assets;
- `RuntimeAssets` автоматически preloads все 63 full-stage assets через `characterRigs`.

## Ограниченная emotion/action taxonomy

Сценарий содержит больше оттенков эмоций и действий, чем production package. Runtime по-прежнему
сводит их к пяти устойчивым выражениям и использует neutral как безопасный fallback, если точного
совпадения нет. Это сознательная переиспользуемая политика, а не требование производить новый PNG
для каждой ремарки.

Pose B включается только по character-specific semantic tokens. Например, телефонная ремарка может
включить Ayuki phone pose, но больше не включает несоответствующую Emi arms-crossed pose. Если
доступный Pose B не соответствует действию, runtime оставляет ближайший Pose A expression.

## Geometry baseline

Canonical neutral alpha bounds и eye line записаны в `src/data/characterProduction.ts` и зеркалятся
в `docs/art/CHARACTER_USAGE_MANIFEST.json`. Все девять rigs используют `staging.scale = 1` и
`yPercent = 0`; character-specific CSS zoom не применяется.

Lineup сохраняет Onoe как относительный reference. Измеренная alpha-height находится в диапазоне
`1368–1484 px`; меньший Miku master остаётся намеренно ниже остальных, а не растягивается runtime.

## Audit update

`src/content/art/ANM030A.asset-gap-audit.json` обновлён как производная матрица:

- production-ready full-stage characters: `9`;
- mixed/planned full-stage characters: `0`;
- outstanding full-stage assets: `0`;
- `cast:<main-character>` удалены из per-slot production gaps;
- guest/background/hero-clue/Match-3 gaps не меняются.

## Automated gate

CI проверяет:

1. 9 × 7 уникальных runtime paths;
2. существование, PNG canvas и medallion dimensions;
3. exact alpha bounds всех 45 expression frames;
4. общий pivot/staging и approved visual status;
5. отсутствие built-in Emi runtime override;
6. production speaker routing вместо placeholders;
7. полную девятиперсонажную Scene Studio lineup;
8. обновлённую production-gap matrix без cast gaps.
9. SHA-256 character/package digests для exact adoption всех 63 файлов source archive.

## iPhone QA

На `/preview/`:

1. проверить New Game и ранние сцены Emi/Kentaro/Norihiro/Mayu;
2. через Story QA перейти к эпизодам с Kurose и Rina;
3. проверить neutral/smile/serious/surprised/embarrassed без прыжка canvas/pivot;
4. проверить character-specific Pose B в подходящих ремарках и отсутствие неверного Pose B в
   остальных;
5. открыть Scene Studio lineup и подтвердить девять персонажей, общий масштаб и читаемые eye guides;
6. проверить solo/duo/trio, особенно Miku рядом с более высокими masters;
7. подтвердить отсутствие старого Emi candidate art и portrait placeholders у main cast.

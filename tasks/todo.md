# 二次部位の分数カウント

## Goal

週次ボリューム集計を、主働 1.0 / 主要二次 0.5 の fractional counting に揃える。全ルーティン共通。

## Decisions

- 主働・共主働: 1.0 / 主要二次: 0.5 / 安定筋: 加算しない
- `ProgramRow.muscles` を `{ muscle, weight }[]` に変更
- 共有プリセットは `src/lib/muscle-load.ts`
- ランドマーク（MEV/MAV/MRV）数値は据え置き。処方セット変更はしない

## マトリクス

- ベンチ / スポト: 胸 1.0、三頭・肩 0.5
- OHP: 肩 1.0、三頭 0.5
- CGBP / フロア: 胸・三頭 1.0
- インクライン: 胸 1.0、肩・三頭 0.5
- デッド: 後面 1.0、僧帽 0.5
- RDL / ノルディック: 後面 1.0
- スクワット / フロント: 四頭 1.0、後面 0.5
- ロウ: 背中 1.0、二頭・僧帽 0.5
- 懸垂 / チン: 背中・二頭 1.0
- シュラッグ: 僧帽 1.0
- アップライトロウ: 肩・僧帽 1.0
- サイド／リアレイズ: 肩 1.0
- カール: 二頭 1.0
- エクステンション等: 三頭 1.0

## Plan

- [x] `MuscleContribution` 型と `muscle-load.ts` を追加
- [x] iron-16 / mav-mrv-5 / ab-meso-5 をプリセットへ置換、`weeklyVolumes` を重み対応
- [x] UI（小数表示・二次バッジ）と export を更新
- [x] AGENTS.md / content.ts を更新
- [x] 代表週の検算、`volumeAudit`、lint / tsc

## Review

- `volumeAudit(iron-16)`: 0 issues（処方変更なしで通過）
- iron W1 僧帽: 19（シュラッグ12 + アップライト3 + デッド2 + ロウ2）
- ab-meso-5 W3 僧帽: 10（デッド×0.5×2日=4 + シュラッグ6）
- `tsc --noEmit` / `eslint` 通過

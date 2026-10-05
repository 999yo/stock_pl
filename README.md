# Stock PL — 株損益通算アプリ

転職ポートフォリオ向けの Web アプリケーションです。  
**平均取得単価法**で売買履歴から実現損益・保有銘柄を計算し、グラフで可視化します。

## 技術スタック

| レイヤ | 技術 |
|--------|------|
| バックエンド | Java 21 / Spring Boot 3 |
| フロントエンド | React 19 / TypeScript / Vite / Tailwind CSS |
| グラフ | Recharts |
| テスト | JUnit 5 |

## 主な機能

- 買付・売却取引の登録・削除
- **平均取得単価法**による実現損益計算
- 保有銘柄サマリー（数量・平均単価・取得総額）
- 累積実現損益の折れ線グラフ
- 銘柄別取得総額の棒グラフ
- サンプルデータのワンクリック読み込み

## 損益計算ロジック（平均取得単価法）

```
買付時: 新平均単価 = (保有数量 × 旧平均単価 + 買付数量 × 買付単価) / 新保有数量
売却時: 実現損益 = (売却単価 - 平均単価) × 売却数量
```

売却後も残り株の平均単価は変わりません（部分売却時）。

## セットアップ

### 前提

1. **Xcode Command Line Tools**（macOS）
   ```bash
   xcode-select --install
   ```

2. **JDK 25**（Temurin LTS — Java 21 でも可）
   ```bash
   java -version   # openjdk 25 以上
   ```

3. **Node.js 20+**（例: [nodejs.org](https://nodejs.org/) または nvm）
   ```bash
   node -version
   ```

4. **Maven**（任意 — プロジェクトに Maven Wrapper を追加する場合は `./mvnw` を使用）

### バックエンド起動

```bash
cd backend
./mvnw spring-boot:run
# → http://localhost:8080
```

### フロントエンド起動

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

ブラウザで `http://localhost:5173` を開き、「サンプルデータを読み込む」で動作確認できます。

### テスト実行

```bash
cd backend
./mvnw test
```

## API 一覧

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/transactions` | 取引一覧 |
| POST | `/api/transactions` | 取引登録 |
| DELETE | `/api/transactions/{id}` | 取引削除 |
| GET | `/api/portfolio/summary` | ポートフォリオサマリー |
| GET | `/api/portfolio/charts/profit` | 累積損益チャート用データ |
| GET | `/api/portfolio/charts/holdings` | 銘柄別取得総額 |

## ポートフォリオでの訴求ポイント

- Java（Spring Boot）での REST API 設計・バリデーション・単体テスト
- ドメインロジック（平均取得単価法）を Service 層に分離
- フロントエンドとの CORS 連携
- TypeScript による型安全な UI 実装

## 今後の拡張案

- [ ] FIFO（先入先出）方式との切り替え
- [ ] CSV インポート / エクスポート
- [ ] H2 / PostgreSQL による永続化
- [ ] ユーザー認証
- [ ] Docker Compose 化

## ライセンス

MIT

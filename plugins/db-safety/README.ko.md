# DB Safety

[English](README.md) | [한국어](README.ko.md)

| | |
|---|---|
| **이름** | db-safety |
| **설명** | Backend/Server/DB 안전 프로토콜 - 위험한 작업 승인, SQL 쿼리 가이드, 안전한 마이그레이션 패턴 |
| **버전** | 1.0.0 |
| **트리거** | "DROP TABLE", "ALTER COLUMN", "DELETE FROM", "마이그레이션", "DB 스키마", "데이터 삭제", "테이블 변경", "SQL 쿼리", "Supabase", "위험한 작업" |

---

Claude Code용 안전한 데이터베이스 작업 플러그인. 필수 승인 워크플로우, SQL 안전 가이드, 검증된 마이그레이션 패턴을 통해 실수로 인한 데이터 손실을 방지합니다.

## 기능

- **위험한 작업 차단**: DROP, ALTER, DELETE, TRUNCATE 작업에 대한 자동 승인 요청
- **SQL 쿼리 가이드**: 안전한 vs 위험한 SQL 패턴 설명
- **안전한 마이그레이션 패턴**: 컬럼 삭제, 타입 변경, 스키마 진화를 위한 검증된 방법
- **환경 분리**: Dev DB (자유로운 실험) vs Prod DB (CI/CD만 허용)
- **위험 수준 분류**: LOW, MEDIUM, HIGH, CRITICAL 각각에 맞는 처리
- **롤백 절차**: 마이그레이션 실패 및 프로덕션 장애 복구 전략

## 설치

### 방법 1: 마켓플레이스 (권장)

```bash
# 1단계: 마켓플레이스 추가
/plugin marketplace add lbo728/opengiver-skills

# 2단계: 플러그인 설치
/plugin install db-safety@opengiver-skills

# 3단계: Claude Code 재시작
```

### 방법 2: UI로 설치

```bash
# 플러그인 매니저 열기
/plugin

# "Marketplaces" 탭 → Add → 입력: lbo728/opengiver-skills
# "Discover" 탭으로 이동 → "db-safety" 찾기 → Install
```

### 방법 3: 수동 설치

```bash
# 저장소 클론 후 스킬 디렉토리로 복사
git clone https://github.com/lbo728/opengiver-skills.git
cp -r opengiver-skills/plugins/db-safety ~/.claude/plugins/
```

## 사용법

플러그인은 데이터베이스 작업을 언급할 때 자동으로 활성화됩니다:

### 위험한 작업 (승인 필요)

```
"DROP TABLE users"
→ 에이전트: ⚠️ 위험한 작업 감지 - 승인 필요
  영향 분석, 위험 요소, 안전한 대안 표시

"ALTER COLUMN user_id TYPE BIGINT"
→ 에이전트: ⚠️ 고위험 스키마 변경 - 승인 필요
  Expand-Contract 패턴 제안

"DELETE FROM logs"
→ 에이전트: ⚠️ WHERE 절 없는 대량 삭제 - 승인 필요
  확인 및 롤백 계획 요청
```

### SQL 쿼리 가이드

```
"사용자 이름을 안전하게 업데이트하려면?"
→ 에이전트: WHERE 절이 있는 안전한 UPDATE 패턴 표시
  ✅ UPDATE users SET name = 'New' WHERE id = 123;
  ❌ UPDATE users SET name = 'New';  (위험!)

"DELETE와 TRUNCATE의 차이점은?"
→ 에이전트: 안전성 영향을 포함한 설명
  DELETE: 느림, 롤백 가능, WHERE 절 사용
  TRUNCATE: 빠름, 롤백 불가, 승인 없이 절대 사용 금지
```

### 안전한 마이그레이션 패턴

```
"컬럼을 안전하게 제거하려면?"
→ 에이전트: 3단계 안전 삭제 패턴 표시
  1주차: 코드에서 컬럼 사용 중단
  2주차: _deprecated_*로 이름 변경 (soft delete)
  4주차: 실제 삭제 (수동 승인)

"컬럼 타입을 변경하려면?"
→ 에이전트: Expand-Contract 패턴 표시
  1단계: 새 타입의 컬럼 추가
  2단계: 기존 데이터 마이그레이션 (배치로)
  3단계: 코드에서 새 컬럼 사용
  4단계: 기존 컬럼 삭제 (2주 후)
```

### 환경 규칙

```
"프로덕션 데이터베이스를 수정할 수 있나?"
→ 에이전트: 환경 분리 설명
  ✅ Dev DB: 자유롭게 실험 가능
  ❌ Prod DB: 읽기 전용 (SELECT), CI/CD만 변경 허용
  
"이 마이그레이션을 dev에서 먼저 테스트해야 하나?"
→ 에이전트: 네! 항상 prod 전에 dev에서 테스트
  체크리스트: 마이그레이션 테스트, 롤백 SQL, 빌드 성공, 데이터 영향
```

## 위험 수준 & 처리 방법

| 수준 | 작업 | 에이전트 행동 |
|------|------|------------|
| ✅ **LOW** | SELECT, INSERT, ADD COLUMN (nullable) | 즉시 실행 |
| ⚠️ **MEDIUM** | UPDATE (WHERE 포함), ADD INDEX | 확인 후 실행 |
| 🟠 **HIGH** | ALTER TYPE, RENAME COLUMN | 승인 + 롤백 계획 요청 |
| 🔴 **CRITICAL** | DROP, TRUNCATE, DELETE (WHERE 없음) | **실행 차단**, 명시적 승인 필요 |

## 승인 요청 형식

위험한 작업이 감지되면:

```
⚠️ **위험한 작업 감지 - 승인 필요**

## 요청된 작업
{작업 내용 요약}

## 예상되는 영향
- **Dev DB**: {영향 설명}
- **Prod DB**: {영향 설명}
- **기존 데이터**: {영향 설명}

## 위험 요소
1. {위험 1}
2. {위험 2}

## 안전한 대안 (권장)
{더 안전한 방법이 있다면 제안}

## 진행하려면
- [ ] Dev에서 먼저 테스트 완료
- [ ] Prod 백업 확인
- [ ] 롤백 SQL 준비

**이 작업을 진행할까요? (yes/no)**
```

## SQL 안전 가이드

### 안전한 작업 (승인 불필요)

```sql
-- SELECT: 항상 안전
SELECT * FROM books WHERE user_id = 'abc123';

-- INSERT: 항상 안전
INSERT INTO books (title, author) VALUES ('제목', '저자');

-- ADD COLUMN (nullable): 안전
ALTER TABLE books ADD COLUMN memo TEXT;
```

### 위험한 작업 (승인 필요)

```sql
-- WHERE 절 없는 DELETE: 위험!
DELETE FROM books;  -- ❌ 모든 데이터 삭제!

-- WHERE 절 없는 UPDATE: 위험!
UPDATE books SET status = 'archived';  -- ❌ 모든 행 업데이트!

-- DROP: 되돌릴 수 없음!
DROP TABLE books;  -- ❌ 영구 삭제!

-- ALTER TYPE: 데이터 손실 위험!
ALTER TABLE books ALTER COLUMN page_count TYPE BIGINT;  -- ❌ 실패할 수 있음!
```

## 안전한 마이그레이션 패턴

### 컬럼 추가 (안전)

```sql
-- 1단계: nullable 컬럼 추가
ALTER TABLE books ADD COLUMN created_at TIMESTAMP;
-- 기존 행은 NULL로 채워짐, 앱에서 새 컬럼 사용 시작
```

### 컬럼 삭제 (3단계 안전 패턴)

```
1주차: 코드에서 컬럼 사용 중단
2주차: _deprecated_*로 이름 변경 (soft delete)
       ALTER TABLE books RENAME COLUMN old_col TO _deprecated_old_col_20260127;
4주차: 실제 삭제 (수동 승인)
       ALTER TABLE books DROP COLUMN _deprecated_old_col_20260127;
```

### 컬럼 타입 변경 (Expand-Contract 패턴)

```
1단계 - Expand (확장): 새 타입의 컬럼 추가
  ALTER TABLE books ADD COLUMN status_new book_status_enum;

2단계 - Migrate (이전): 기존 데이터 변환
  UPDATE books SET status_new = status::book_status_enum;

3단계 - Switch (전환): 코드에서 새 컬럼 사용
  // 코드 변경...

4단계 - Contract (축소): 기존 컬럼 삭제 (2주 후)
  ALTER TABLE books DROP COLUMN status;
  ALTER TABLE books RENAME COLUMN status_new TO status;
```

## 배포 전 체크리스트

DB 변경사항을 프로덕션에 머지하기 전:

- [ ] Dev DB에서 마이그레이션 테스트 완료
- [ ] 롤백 SQL 준비 (파괴적 변경 시)
- [ ] 앱 빌드 성공 확인
- [ ] 기존 데이터에 영향 없음 확인

파괴적 변경 포함 시 추가:

- [ ] 3단계 삭제 패턴 적용 (즉시 삭제 X)
- [ ] Prod 백업 시점 확인 (PITR 가능)
- [ ] 영향받는 사용자 수 파악
- [ ] 다운타임 필요 여부 확인

## 롤백 절차

### 마이그레이션 실패

1. 에러 메시지 확인
2. 부분 적용 여부 확인 (테이블/컬럼 상태)
3. 롤백 SQL 실행 또는 PITR 복구

### 프로덕션 장애

1. **즉시**: 영향받는 기능 비활성화 (feature flag)
2. **5분 내**: 원인 파악 (로그 확인)
3. **15분 내**: 롤백 결정 (코드 or DB)
4. **복구 후**: 포스트모템 작성

## 플러그인 구조

```
db-safety/
├── .claude-plugin/
│   └── plugin.json           # 플러그인 매니페스트
├── skills/
│   └── db-safety/
│       └── SKILL.md          # 자연어 스킬
├── README.md
└── README.ko.md
```

## 라이선스

MIT

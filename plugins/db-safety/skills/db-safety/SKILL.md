---
name: db-safety
description: |
  Backend/Server/DB Safety Protocol for managing dangerous database operations safely.
  MUST load when: (1) Database operations (DROP, ALTER, DELETE, TRUNCATE), (2) SQL migrations,
  (3) Supabase/database schema changes, (4) Data modification requests, (5) Production DB access
  Trigger examples: "DROP TABLE", "ALTER COLUMN", "DELETE FROM", "마이그레이션", "DB 스키마",
  "데이터 삭제", "테이블 변경", "SQL 쿼리", "Supabase", "dangerous operation"
---

# Backend/Server/DB Safety Protocol

소규모 풀스택 프로젝트에서 백엔드, 서버, DB를 안전하게 관리하기 위한 필수 규칙.

## 🚨 BLOCKING: 위험 작업 사전 승인 프로토콜

### Trigger Condition

다음 작업 지시를 받으면 **즉시 작업을 멈추고 사용자에게 승인을 요청**:

| 위험 수준 | 작업 유형 | 예시 |
|----------|----------|------|
| 🔴 **CRITICAL** | 데이터 삭제 | DROP TABLE, DROP COLUMN, TRUNCATE, DELETE FROM |
| 🔴 **CRITICAL** | 스키마 파괴적 변경 | 컬럼 타입 변경, NOT NULL 추가 |
| 🟠 **HIGH** | 대량 데이터 수정 | UPDATE ... WHERE (조건 없거나 넓은 범위) |
| 🟠 **HIGH** | 인증/권한 변경 | RLS 정책 수정, 사용자 권한 변경 |
| 🟡 **MEDIUM** | 외부 서비스 연동 | API 키 변경, 웹훅 엔드포인트 수정 |

### 승인 요청 템플릿 (MANDATORY)

위험 작업 감지 시 **반드시** 아래 형식으로 사용자에게 승인 요청:

```
⚠️ **위험 작업 감지 - 승인 필요**

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

### 절대 자동 실행 금지 목록

다음 SQL은 **어떤 상황에서도 자동 실행 금지**. 반드시 사용자 승인 후 실행:

```sql
-- ❌ 절대 자동 실행 금지
DROP TABLE ...
DROP COLUMN ...
TRUNCATE ...
DELETE FROM ... (WHERE 없이)
ALTER ... TYPE ... (데이터 타입 변경)
UPDATE ... SET ... (WHERE 없이 또는 전체 테이블 대상)
```

---

## 📊 SQL 쿼리 기본 가이드 (비개발자용)

### 데이터 조회 (SELECT) - 안전함

```sql
-- 테이블의 모든 데이터 조회
SELECT * FROM books;
-- 의미: books 테이블의 모든 행(row)과 열(column)을 가져와라

-- 특정 조건으로 필터링
SELECT * FROM books WHERE user_id = 'abc123';
-- 의미: books 테이블에서 user_id가 'abc123'인 것만 가져와라

-- 특정 열만 선택
SELECT title, author FROM books;
-- 의미: books 테이블에서 title과 author 열만 가져와라

-- 정렬
SELECT * FROM books ORDER BY created_at DESC;
-- 의미: 생성일 기준 최신순(내림차순)으로 정렬해서 가져와라

-- 개수 제한
SELECT * FROM books LIMIT 10;
-- 의미: 최대 10개만 가져와라
```

### 데이터 추가 (INSERT) - 안전함

```sql
-- 새 데이터 추가
INSERT INTO books (title, author, user_id) 
VALUES ('책 제목', '저자명', 'user123');
-- 의미: books 테이블에 새로운 행을 추가해라
-- → 기존 데이터에 영향 없음, 안전함
```

### 데이터 수정 (UPDATE) - ⚠️ 주의 필요

```sql
-- ✅ 안전: 특정 행만 수정
UPDATE books SET title = '새 제목' WHERE id = 123;
-- 의미: id가 123인 책의 제목만 변경해라

-- ❌ 위험: WHERE 없이 전체 수정
UPDATE books SET title = '새 제목';
-- 의미: 모든 책의 제목을 '새 제목'으로 변경해라
-- → 전체 데이터가 변경됨! 복구 어려움!
```

### 데이터 삭제 (DELETE) - 🔴 위험

```sql
-- ⚠️ 주의: 특정 행만 삭제
DELETE FROM books WHERE id = 123;
-- 의미: id가 123인 책만 삭제해라

-- ❌ 극히 위험: WHERE 없이 전체 삭제
DELETE FROM books;
-- 의미: books 테이블의 모든 데이터 삭제!
-- → 복구 불가능! 절대 사용 금지!

-- ❌ 극히 위험: TRUNCATE
TRUNCATE TABLE books;
-- 의미: books 테이블의 모든 데이터를 즉시 삭제 (DELETE보다 빠름)
-- → 복구 불가능! 절대 사용 금지!
```

### 테이블 구조 변경 (ALTER) - 🔴 주의 필요

```sql
-- ✅ 안전: 새 컬럼 추가 (nullable)
ALTER TABLE books ADD COLUMN memo TEXT;
-- 의미: books 테이블에 memo라는 새 열을 추가해라
-- → 기존 데이터의 memo는 NULL로 채워짐, 안전함

-- ⚠️ 주의: NOT NULL 컬럼 추가
ALTER TABLE books ADD COLUMN memo TEXT NOT NULL DEFAULT '';
-- 의미: memo 열을 추가하되, NULL 불허, 기본값은 빈 문자열
-- → 기존 데이터에 기본값이 자동 적용됨

-- ❌ 위험: 컬럼 삭제
ALTER TABLE books DROP COLUMN memo;
-- 의미: memo 열을 삭제해라
-- → 해당 열의 모든 데이터가 영구 삭제됨!

-- ❌ 위험: 컬럼 타입 변경
ALTER TABLE books ALTER COLUMN page_count TYPE BIGINT;
-- 의미: page_count의 데이터 타입을 BIGINT로 변경해라
-- → 기존 데이터가 변환 불가능하면 에러 발생!
```

### 테이블 삭제 (DROP) - 🔴 극히 위험

```sql
-- ❌ 극히 위험
DROP TABLE books;
-- 의미: books 테이블 자체를 삭제해라
-- → 테이블과 모든 데이터가 영구 삭제됨!
-- → 복구 불가능! 절대 자동 실행 금지!
```

---

## 🛡️ 안전한 마이그레이션 패턴

### 컬럼 추가 (안전)

```sql
-- 1단계: nullable 컬럼 추가
ALTER TABLE books ADD COLUMN book_memo_date TIMESTAMP;
-- → 기존 데이터는 NULL로 채워짐
-- → 앱에서 새 컬럼 사용 시작
```

### 컬럼 삭제 (3단계 안전 패턴)

```
Week 1: 코드에서 해당 컬럼 사용 중단
        ↓
Week 2: 컬럼명 변경 (soft delete)
        ALTER TABLE books 
        RENAME COLUMN old_column TO _deprecated_old_column_20260122;
        ↓
Week 4: 문제 없으면 실제 삭제 (수동으로!)
        ALTER TABLE books DROP COLUMN _deprecated_old_column_20260122;
```

### 컬럼 타입 변경 (Expand-Contract 패턴)

```
Step 1 - Expand (확장):
  ALTER TABLE books ADD COLUMN status_new book_status_enum;
  -- 새 타입의 컬럼 추가

Step 2 - Migrate (이전):
  UPDATE books SET status_new = status::book_status_enum;
  -- 기존 데이터 변환 (배치로 나눠서)

Step 3 - Switch (전환):
  -- 코드에서 status_new 사용하도록 변경

Step 4 - Contract (축소):
  ALTER TABLE books DROP COLUMN status;
  ALTER TABLE books RENAME COLUMN status_new TO status;
  -- 2주 후 실제 삭제
```

---

## 🔐 환경별 DB 접근 규칙

### Supabase 프로젝트 구분

| 환경 | 용도 | 직접 수정 |
|------|------|----------|
| **Dev** | 개발/테스트 | ✅ 허용 |
| **Prod** | 프로덕션 | ❌ CI/CD만 |

### Agent 작업 시 규칙

1. **Dev DB**: 자유롭게 실험 가능
2. **Prod DB**: 
   - 읽기(SELECT): 허용
   - 쓰기(INSERT/UPDATE/DELETE): 승인 필요
   - 스키마 변경: CI/CD 통해서만

### MCP 사용 규칙

```json
{
  "supabase-dev": { "enabled": true },   // 개발 DB - 항상 ON
  "supabase-prod": { "enabled": false }  // 프로덕션 - 항상 OFF
}
```

**Prod MCP 활성화 요청 시**: 반드시 이유 확인 후 승인

---

## 🚀 배포 전 체크리스트 (MANDATORY)

### Dev → Main 머지 전

- [ ] Dev DB에서 마이그레이션 테스트 완료
- [ ] 롤백 SQL 준비 (파괴적 변경 시)
- [ ] 앱 빌드 성공 확인
- [ ] 기존 데이터에 영향 없음 확인

### 파괴적 변경 포함 시 추가 체크

- [ ] 3단계 삭제 패턴 적용 (즉시 삭제 X)
- [ ] Prod 백업 시점 확인 (PITR)
- [ ] 영향받는 사용자 수 파악
- [ ] 다운타임 필요 여부 확인

---

## 📋 위험 수준별 대응 표

| 위험 수준 | 작업 예시 | Agent 행동 |
|----------|----------|------------|
| ✅ **LOW** | SELECT, INSERT, ADD COLUMN (nullable) | 즉시 실행 가능 |
| ⚠️ **MEDIUM** | UPDATE (조건부), ADD INDEX | 확인 후 실행 |
| 🟠 **HIGH** | ALTER TYPE, RENAME | 승인 요청 필수 |
| 🔴 **CRITICAL** | DROP, TRUNCATE, DELETE (전체) | **절대 자동 실행 금지**, 반드시 승인 |

---

## 🆘 롤백 대응

### 마이그레이션 실패 시

1. 에러 메시지 확인
2. 부분 적용됐는지 확인 (테이블/컬럼 상태)
3. 롤백 SQL 실행 또는 PITR 복구

### 프로덕션 장애 시

1. **즉시**: 앱 기능 비활성화 (feature flag)
2. **5분 내**: 원인 파악 (로그 확인)
3. **15분 내**: 롤백 결정 (코드 or DB)
4. **복구 후**: 포스트모템 작성

---

**이 프로토콜은 SKIP 불가. 위험 작업은 반드시 승인 후 진행.**

# 🎨 p5.js 팀플 프론트엔드 규칙 요약

## 1️⃣ 네이밍 규칙

- 변수/함수: `camelCase`
- 상수: `ALL_CAPS_WITH_UNDERSCORE`
- 훅(hook): `use`로 시작 (예: `useTimer`)
- 컴포넌트/클래스/타입: `PascalCase`
- 이미지: `snake_case`

📁 **예시**

❌ `src/assets/userAvatar.png`

✅ `src/assets/img_user_avatar.png`

---

## 2️⃣ 코드 작성 원칙

- 누구나 **30분 안에 이해 가능한 코드**로 작성
- **ESLint 기본 규칙 준수**
- **추상화는 3단계 이하**로 (너무 쪼개지 말기)
- **가독성 > 코드 길이** (짧은 코드보다 읽기 쉬운 코드가 우선)

---

## 3️⃣ 읽기 쉬운 코드 작성법

### ✅ 복잡한 조건문 피하기

```jsx
// ❌ 나쁜 예시
if (a && (b || c) && d && !e) doSomething();

// ✅ 좋은 예시
const isValid = a;
const hasPermission = b || c;
const isAllowed = d && !e;

if (isValid && hasPermission && isAllowed) doSomething();
```

## ✅ Early Return (조기 반환)

```jsx
// ❌ 나쁜 예시
function drawShape(shape) {
  if (shape) {
    if (shape.isVisible) {
      render(shape);
    }
  }
}

// ✅ 좋은 예시
function drawShape(shape) {
  if (!shape || !shape.isVisible) return;
  render(shape);
}
```

## 4️⃣ 설계 원칙

- **깊은 모듈, 단순한 인터페이스**
  → 기능은 내부에서 복잡하더라도, 사용하는 쪽은 단순해야 함
  → (ex. `drawCircle(x, y, size)`는 내부 복잡해도 외부 사용은 단순)
- **불필요한 의존성 줄이기**
  → “복붙이 낫다”는 말처럼, 억지로 공통화하지 말기
  → 중복 코드보다 잘못된 추상화가 더 위험함
- **명시적이고 직관적인 코드**
  → 숫자 코드 대신 의미 있는 이름 사용
  → ex. `if (status === 'jwt_expired')` ✅ / `if (status === 403)` ❌

---

## 5️⃣ 피해야 할 패턴

- 상속보다 **조립(Composition)**
- “미래 대비용” 복잡한 아키텍처 ❌
- 너무 일찍 쪼개는 컴포넌트 ❌
- 언어 기능 남용 ❌ → _단순한 방법이 최고!_

---

🧠 **핵심 요약**

> 단순하게, 명확하게, 읽기 쉽게
>
> “읽는 사람이 이해하기 쉬운 코드가 좋은 코드다.”

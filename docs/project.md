### 🤝 협업을 위한 핵심 규칙 (API 정의)

충돌을 막기 위해, 게임의 모든 핵심 상태를 **하나의 전역 객체**(`gameData`)에서 관리합니다.

  * `sketch.js` 최상단에 이 객체를 정의합니다.
  * **[B] 이승민 (로직)**: 이 객체의 데이터를 \*\*업데이트(Write)\*\*하는 유일한 사람입니다.
  * **[A] 이영애 (UI)** / **[C] 김민후 (시각화)**: 이 객체의 데이터를 **읽기만(Read)** 해서 화면에 그립니다.

<!-- end list -->

```javascript
/* ---------------------------------
 * API: 전역 게임 데이터 객체
 * [B] 이승민만 이 값을 수정합니다.
 * [A], [C]는 이 값을 읽어서 그리기만 합니다.
 * --------------------------------- */
let gameData = {
  currentScene: "START", // "START", "PLAYING", "WIN", "LOSE_CAUGHT", "LOSE_TIME"
  distance: 50.0,        // 남은 거리 (m)
  timeLeft: 60,          // 남은 시간 (초)
  isRedLight: false,     // 빨간불(뒤돌아봄) 여부
  subtitle: "",          // 현재 자막 ("무", "무궁화...")
  isPlayerMoving: false  // (내부용) 현재 플레이어가 키를 누르고 있는지
};

/* ---------------------------------
 * 에셋 변수 (A가 preload에서 채움)
 * --------------------------------- */
let imgBg, imgProfessorFront, imgProfessorBack;
let soundBgm, soundCaught; 
```

### 💻 메인 루프 구조 (작업 분리)

`draw()` 함수는 각자의 함수를 호출하는 '지휘자' 역할만 합니다. 이렇게 하면 같은 파일을 수정해도 충돌이 거의 나지 않습니다.

```javascript
// [A] 이영애 담당: 모든 에셋 미리 로드
function preload() {
  A_preloadAssets();
}

// [공통] 최초 1회 설정
function setup() {
  createCanvas(800, 600);
  //... 기타 설정
}

// 매 프레임 실행되는 메인 루프
function draw() {
  
  // 1. [B] 이승민: 게임 로직 업데이트 (데이터 변경)
  //    (단, 'PLAYING' 상태일 때만 로직이 돌아가도록)
  if (gameData.currentScene === "PLAYING") {
    B_updateGameLogic(); 
  }

  // 2. [C] 김민후: 게임 월드(배경, 술래) 그리기 (데이터 읽기)
  C_drawWorld();

  // 3. [A] 이영애: UI(시작/종료 화면, HUD) 그리기 (데이터 읽기)
  A_drawUI();
}

// 4. [B] 이승민: 키보드 입력 처리 (데이터 변경)
function keyPressed() {
  B_handleKeyPress();
}
function keyReleased() {
  B_handleKeyRelease();
}

// --- 각자 이 아래에 자기 함수를 만듭니다 ---
// function A_preloadAssets() { ... }
// function B_updateGameLogic() { ... }
// function C_drawWorld() { ... }
// function A_drawUI() { ... }
// ...
```

-----

### 👤 개인별 MVP 작업 로드맵

#### [A] 이영애 (PM / UI Coder / QA)

**임무: 게임의 '껍데기'와 '정보창'을 만듭니다. `gameData`를 읽어서 그립니다.**

1.  **Phase 1 (기획/설정)**

      * [ ] **MVP 기획서 최종 확정**: 딱 MVP까지만. (난이도 없음, 시간 60초 고정, 거리 50m 고정)
      * [ ] **`A_preloadAssets()` 함수 구현 (코딩 ⭐️)**
          * `preload()` 안에서 `loadImage()`, `loadSound()`를 호출합니다.
          * `imgBg`, `imgProfessorFront` 등 **전역 변수**에 이미지를 할당합니다. ([C]가 이 변수를 사용합니다)

2.  **Phase 2 (핵심 개발)**

      * [ ] **`A_drawUI()` 함수 뼈대 구현 (코딩 ⭐️)**
          * `A_drawUI()` 함수를 만들고, 그 안에서 `gameData.currentScene`에 따라 `switch` 문을 만듭니다.
          * `case "START": A_drawStartScene(); break;`
          * `case "WIN": A_drawWinScene(); break;`
          * `case "LOSE_CAUGHT": A_drawLoseScene("잡혔습니다!"); break;`
      * [ ] **정적 화면 3개 구현 (코딩 ⭐️)**
          * `A_drawStartScene()`: "시작하려면 스페이스바를 누르세요" 텍스트 출력
          * `A_drawWinScene()`: "성공\!" 텍스트 출력
          * `A_drawLoseScene()`: "탈락" 텍스트 출력

3.  **Phase 3 (통합)**

      * [ ] **HUD(정보창) 구현 (코딩 ⭐️)**
          * `A_drawUI()` 함수 상단에, `gameData.currentScene === "PLAYING"`일 때만 HUD를 그리도록 코드를 추가합니다.
          * `text(gameData.distance, ...)`: [B]가 계산한 남은 거리 표시
          * `text(gameData.timeLeft, ...)`: [B]가 계산한 남은 시간 표시
      * [ ] **자막 표시 (코딩 ⭐️)**
          * `text(gameData.subtitle, ...)`: [B]가 제공한 자막 텍스트를 화면 하단에 표시합니다.
          * *(애니메이션은 MVP 이후에\! 지금은 그냥 텍스트만 띄웁니다.)*

4.  **Phase 4 & 5 (마무리)**

      * [ ] QA 및 간단한 UI 위치 수정
      * [ ] GitHub Pages 배포
      * [ ] PPT 발표 자료 작성

-----

#### [B] 이승민 (게임 엔진 / 핵심 로직)

**임무: 게임의 '두뇌'를 만듭니다. `gameData` 객체를 유일하게 수정합니다.**

1.  **Phase 1 (기획/설정)**

      * [ ] **프로젝트 구성**: `sketch.js`에 위 `gameData` 객체와 `draw()` 루프 구조를 맨 처음 작성합니다.
      * [ ] AI 프롬프트 구성 (공동)

2.  **Phase 2 (핵심 개발)**

      * [ ] **`B_handleKeyPress()`, `B_handleKeyRelease()` 구현 (코딩 ⭐️)**
          * 스페이스바가 눌리면 `gameData.isPlayerMoving = true;`
          * 스페이스바를 떼면 `gameData.isPlayerMoving = false;`
          * `START` 화면에서 스페이스바가 눌리면 `gameData.currentScene = "PLAYING";`
      * [ ] **`B_updateGameLogic()` 함수 구현 (코딩 ⭐️)**
          * **타이머 로직**: `millis()`를 사용해 "무궁화..." 시간, 뒤돌아보는 시간을 구현하고 `gameData.isRedLight`를 `true`/`false`로 변경합니다.
          * **자막 로직**: 타이머에 맞춰 `gameData.subtitle`에 "무", "무궁", "무궁화 꽃이" 등 텍스트를 업데이트합니다. (MVP는 그냥 통째로 넣기)
          * **시간 로직**: 1초마다 `gameData.timeLeft`를 1씩 감소시킵니다.

3.  **Phase 3 (통합)**

      * [ ] **판정 로직 구현 (코딩 ⭐️)**
          * `B_updateGameLogic()` 내부에 다음을 추가합니다.
          * `if (gameData.isPlayerMoving && !gameData.isRedLight)`: `gameData.distance` 감소
          * `if (gameData.isPlayerMoving && gameData.isRedLight)`: `gameData.currentScene = "LOSE_CAUGHT";`
          * `if (gameData.timeLeft <= 0)`: `gameData.currentScene = "LOSE_TIME";`
          * `if (gameData.distance <= 0)`: `gameData.currentScene = "WIN";`

4.  **Phase 4 & 5 (마무리)**

      * [ ] 핵심 로직 버그 수정
      * [ ] PPT 발표 자료 중 로직 파트 정리 (자료 [A]에게 전달)

-----

#### [C] 김민후 (1인칭 시각화 / 에셋 연동)

**임무: 게임의 '배경'과 '술래'를 그립니다. `gameData`를 읽어서 그립니다.**

1.  **Phase 1 (기획/설정)**

      * [ ] **GitHub 저장소 생성** 및 팀원 초대
      * [ ] AI 프롬프트 구성 (공동)
      * [ ] (대기) [A]가 `preload`에 에셋을 로드할 때까지 기다리거나, 임시 이미지로 작업

2.  **Phase 2 (핵심 개발)**

      * [ ] **`C_drawWorld()` 함수 구현 (코딩 ⭐️)**
          * `background(imgBg);`: [A]가 로드한 배경 이미지를 그립니다. (만약 `START`나 `WIN` 화면에선 배경이 안 보여야 한다면 `if (gameData.currentScene === "PLAYING")` 조건 추가)
      * [ ] **1인칭 원근법 구현 (코딩 ⭐️)**
          * `gameData.distance` 값을 `map()` 함수 등을 이용해 이미지 크기(scale)와 y 위치(position)로 변환합니다. (이게 핵심\!)
          * `let scale = map(gameData.distance, 50, 0, 0.5, 3);` (예시)
          * `let yPos = map(gameData.distance, 50, 0, 100, 300);` (예시)

3.  **Phase 3 (통합)**

      * [ ] **술래 이미지 교체 (코딩 ⭐️)**
          * `C_drawWorld()` 함수 내에서 `gameData.isRedLight` 값을 확인합니다.
          * `if (gameData.isRedLight)`: `image(imgProfessorFront, ...)` (계산된 scale, yPos 사용)
          * `else`: `image(imgProfessorBack, ...)` (계산된 scale, yPos 사용)

4.  **Phase 4 & 5 (마무리)**

      * [ ] 시각적 버그 수정 (이미지 위치, 크기)
      * [ ] PPT 발표 자료 중 시각화 파트 정리 (자료 [A]에게 전달)
import p5 from "p5";

// p5.js의 Friendly Error System 비활성화 (성능 향상 및 에러 방지)
(window as any).p5 = p5;
(p5 as any).disableFriendlyErrors = true;

/* ---------------------------------
 * API: 전역 게임 데이터 객체
 * [B] 이승민만 이 값을 수정합니다.
 * [A], [C]는 이 값을 읽어서 그리기만 합니다.
 * --------------------------------- */
interface GameData {
  currentScene: "START" | "PLAYING" | "WIN" | "LOSE_CAUGHT" | "LOSE_TIME";
  distance: number; // 남은 거리 (m)
  timeLeft: number; // 남은 시간 (초)
  isRedLight: boolean; // 빨간불(뒤돌아봄) 여부
  subtitle: string; // 현재 자막 ("무", "무궁화...")
}

let gameData: GameData = {
  currentScene: "START",
  distance: 50.0,
  timeLeft: 60,
  isRedLight: false,
  subtitle: "",
};

/* ---------------------------------
 * 에셋 변수 (A가 preload에서 채움)
 * --------------------------------- */
// let imgProfessorFront: p5.Image, imgProfessorBack: p5.Image;
// let soundBgm: any, soundCaught: any; // p5.sound 라이브러리 필요

/* ---------------------------------
 * [B] 이승민 전용 내부 변수
 * --------------------------------- */
// let gameStartTime: number = 0;      // 게임 시작 시각 (나중에 사용 가능)
let lastSecondUpdate: number = 0; // 마지막 초 업데이트 시각
let redLightStartTime: number = 0; // 빨간불 시작 시각
let greenLightStartTime: number = 0; // 초록불 시작 시각
let currentPhase: "green" | "red" = "green"; // 현재 신호등 상태
let spacePressed: boolean = false; // 스페이스바가 현재 눌린 상태인지 추적

const GREEN_LIGHT_DURATION = 3000; // 초록불 지속 시간 (ms)
const RED_LIGHT_DURATION = 2000; // 빨간불 지속 시간 (ms)
const MOVE_DISTANCE_PER_PRESS = 0.5; // 한 번 누를 때마다 이동하는 거리 (m) - 50m / 100회 = 0.5m

const sketch = (p: p5) => {
  // 술래 이미지 변수 (sketch 내부에서 선언)
  let imgHumanGreen: p5.Image | undefined; // 초록불(뒷모습)
  let imgHumanRed1: p5.Image | undefined;  // 빨간불(앞모습 1)
  let imgHumanRed2: p5.Image | undefined;  // 빨간불(앞모습 2)
  let currentRedImage: number = 1;          // 현재 선택된 빨간불 이미지 (1 또는 2)

  /* ---------------------------------
   * [공통] 최초 1회 설정
   * --------------------------------- */
  p.setup = () => {
    p.createCanvas(800, 600);
    p.textAlign(p.CENTER, p.CENTER);

    // setup에서 이미지 로드
    console.log('술래 이미지 로드 시도 중...');

    // 초록불 이미지 (뒷모습)
    p.loadImage('/assets/human_thum.png',
      (img) => {
        imgHumanGreen = img;
        console.log('✅ 초록불 이미지 로드 성공');
      },
      (err) => {
        console.error('❌ 초록불 이미지 로드 실패:', err);
      }
    );

    // 빨간불 이미지 1 (앞모습)
    p.loadImage('/assets/1ju_1.png',
      (img) => {
        imgHumanRed1 = img;
        console.log('✅ 빨간불 이미지 1 로드 성공');
      },
      (err) => {
        console.error('❌ 빨간불 이미지 1 로드 실패:', err);
      }
    );

    // 빨간불 이미지 2 (앞모습)
    p.loadImage('/assets/1ju_2.png',
      (img) => {
        imgHumanRed2 = img;
        console.log('✅ 빨간불 이미지 2 로드 성공');
      },
      (err) => {
        console.error('❌ 빨간불 이미지 2 로드 실패:', err);
      }
    );
  };

  /* ---------------------------------
   * 매 프레임 실행되는 메인 루프
   * --------------------------------- */
  p.draw = () => {
    // 1. [B] 이승민: 게임 로직 업데이트 (데이터 변경)
    if (gameData.currentScene === "PLAYING") {
      B_updateGameLogic();
    }

    // 2. [C] 김민후: 게임 월드(배경, 술래) 그리기 (데이터 읽기)
    C_drawWorld();

    // 3. [A] 이영애: UI(시작/종료 화면, HUD) 그리기 (데이터 읽기)
    A_drawUI();
  };

  /* ---------------------------------
   * [B] 이승민: 키보드 입력 처리 (데이터 변경)
   * --------------------------------- */
  p.keyPressed = () => {
    B_handleKeyPress();
  };

  p.keyReleased = () => {
    B_handleKeyRelease();
  };


  /* =================================
   * [A] 이영애 함수들
   * ================================= */
  // function A_preloadAssets() {
  //   // TODO: [A] 이영애가 구현
  //   // imgBg = p.loadImage('assets/background.png');
  //   // imgProfessorFront = p.loadImage('assets/professor_front.png');
  //   // imgProfessorBack = p.loadImage('assets/professor_back.png');
  //   // soundBgm = p.loadSound('assets/bgm.mp3');
  //   // soundCaught = p.loadSound('assets/caught.mp3');
  // }

  function A_drawUI() {
    // TODO: [A] 이영애가 구현
    // HUD 그리기 (PLAYING 상태일 때)
    if (gameData.currentScene === "PLAYING") {
      p.fill(0);
      p.textSize(20);
      p.textAlign(p.LEFT, p.TOP);
      p.text(`거리: ${gameData.distance.toFixed(1)}m`, 20, 20);
      p.text(`시간: ${gameData.timeLeft}초`, 20, 50);

      // 자막 표시
      if (gameData.subtitle) {
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(32);
        p.text(gameData.subtitle, p.width / 2, p.height - 80);
      }
    }

    // 화면별 UI
    switch (gameData.currentScene) {
      case "START":
        A_drawStartScene();
        break;
      case "WIN":
        A_drawWinScene();
        break;
      case "LOSE_CAUGHT":
        A_drawLoseScene("잡혔습니다!");
        break;
      case "LOSE_TIME":
        A_drawLoseScene("시간 초과!");
        break;
    }
  }

  function A_drawStartScene() {
    p.background(200);
    p.fill(0);
    p.textSize(48);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("무궁화 꽃이 피었습니다", p.width / 2, p.height / 2 - 50);
    p.textSize(24);
    p.text("스페이스바를 눌러 시작하세요", p.width / 2, p.height / 2 + 50);
  }

  function A_drawWinScene() {
    p.background(100, 200, 100);
    p.fill(255);
    p.textSize(64);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("성공!", p.width / 2, p.height / 2);
  }

  function A_drawLoseScene(message: string) {
    p.background(200, 100, 100);
    p.fill(255);
    p.textSize(64);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("탈락", p.width / 2, p.height / 2 - 50);
    p.textSize(32);
    p.text(message, p.width / 2, p.height / 2 + 50);
  }

  /* =================================
   * [B] 이승민 함수들
   * ================================= */
  function B_handleKeyPress() {
    // 스페이스바 처리
    if (p.keyCode === 32) {
      // 이미 눌린 상태면 무시 (중복 입력 방지)
      if (spacePressed) {
        return;
      }
      spacePressed = true;

      if (gameData.currentScene === "START") {
        // 게임 시작
        gameData.currentScene = "PLAYING";
        lastSecondUpdate = p.millis();
        greenLightStartTime = p.millis();
        currentPhase = "green";
        gameData.isRedLight = false;
        gameData.subtitle = "";
      } else if (gameData.currentScene === "PLAYING") {
        // 초록불일 때만 이동 가능
        if (!gameData.isRedLight) {
          gameData.distance -= MOVE_DISTANCE_PER_PRESS;
        } else {
          // 빨간불에 움직이면 즉시 잡힘
          gameData.currentScene = "LOSE_CAUGHT";
        }
      }
    }
  }

  function B_handleKeyRelease() {
    // 스페이스바를 뗐을 때 플래그 해제
    if (p.keyCode === 32) {
      spacePressed = false;
    }
  }

  function B_updateGameLogic() {
    const currentTime = p.millis();

    // 1. 타이머 로직: 신호등 전환
    if (currentPhase === "green") {
      const greenElapsed = currentTime - greenLightStartTime;

      // 자막 업데이트 (초록불 동안)
      if (greenElapsed < 500) {
        gameData.subtitle = "무";
      } else if (greenElapsed < 1000) {
        gameData.subtitle = "무궁";
      } else if (greenElapsed < 1500) {
        gameData.subtitle = "무궁화";
      } else if (greenElapsed < 2000) {
        gameData.subtitle = "무궁화 꽃이";
      } else if (greenElapsed < 2500) {
        gameData.subtitle = "무궁화 꽃이 피";
      } else {
        gameData.subtitle = "무궁화 꽃이 피었습니다";
      }

      // 초록불 시간 종료 → 빨간불로 전환
      if (greenElapsed >= GREEN_LIGHT_DURATION) {
        currentPhase = "red";
        redLightStartTime = currentTime;
        gameData.isRedLight = true;
        gameData.subtitle = "!!!";
        // 빨간불로 전환될 때 랜덤으로 이미지 선택 (1 또는 2)
        currentRedImage = p.random() < 0.5 ? 1 : 2;
      }
    } else if (currentPhase === "red") {
      const redElapsed = currentTime - redLightStartTime;

      // 빨간불 시간 종료 → 초록불로 전환
      if (redElapsed >= RED_LIGHT_DURATION) {
        currentPhase = "green";
        greenLightStartTime = currentTime;
        gameData.isRedLight = false;
        gameData.subtitle = "";
      }
    }

    // 2. 시간 로직: 1초마다 timeLeft 감소
    if (currentTime - lastSecondUpdate >= 1000) {
      gameData.timeLeft--;
      lastSecondUpdate = currentTime;
    }

    // 3. 판정 로직
    // 시간 초과 판정
    if (gameData.timeLeft <= 0) {
      gameData.currentScene = "LOSE_TIME";
    }

    // 승리 판정
    if (gameData.distance <= 0) {
      gameData.currentScene = "WIN";
    }
  }

  /* =================================
   * [C] 김민후 함수들
   * ================================= */
  function C_drawWorld() {
    // TODO: [C] 김민후가 구현
    // 배경 회색으로 그리기
    p.background(220);

    // PLAYING 상태일 때만 게임 월드 그리기
    if (gameData.currentScene === "PLAYING") {
      // 1인칭 원근법으로 술래 그리기
      // distance가 50 → 0으로 줄어들면 술래가 점점 커지고 아래로 내려옴
      const scale = p.map(gameData.distance, 50, 0, 0.5, 3);
      const yPos = p.map(gameData.distance, 50, 0, 100, 400);

      p.push();
      p.translate(p.width / 2, yPos);
      p.scale(scale);

      // 이미지 중심을 기준으로 그리기
      p.imageMode(p.CENTER);

      // 술래 이미지 그리기
      if (gameData.isRedLight) {
        // 빨간불: 1ju_1.png 또는 1ju_2.png (랜덤)
        const selectedRedImg = currentRedImage === 1 ? imgHumanRed1 : imgHumanRed2;

        if (selectedRedImg && selectedRedImg.width > 0) {
          p.image(selectedRedImg, 0, 0, 100, 100);
        } else {
          // 이미지 로드 전 임시 빨간 원 표시
          p.fill(255, 100, 100);
          p.ellipse(0, 0, 100, 100);
        }
      } else {
        // 초록불: human_thum.png (뒷모습)
        if (imgHumanGreen && imgHumanGreen.width > 0) {
          p.image(imgHumanGreen, 0, 0, 100, 100);
        } else {
          // 이미지 로드 전 임시 회색 원 표시
          p.fill(150);
          p.ellipse(0, 0, 100, 100);
        }
      }

      p.pop();
    }
  }
};

// DOM이 완전히 로드된 후 p5 인스턴스 생성
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new p5(sketch);
  });
} else {
  new p5(sketch);
}

import p5 from "p5";

// p5.js의 Friendly Error System 비활성화 (성능 향상 및 에러 방지)
(window as any).p5 = p5;
(p5 as any).disableFriendlyErrors = true;

/* ---------------------------------
 * 술래 시스템 타입 정의
 * --------------------------------- */
interface TaggerConfig {
  id: string; // 술래 고유 ID (예: "1ju", "professor", "robot")
  name: string; // 술래 이름 (예: "1주차", "교수님", "로봇")
  voicePath: string; // 음성 파일 경로
  greenSpritePath: string; // 초록불(뒷모습) 스프라이트 경로
  redSpritePaths: string[]; // 빨간불(앞모습) 스프라이트 경로 배열 (여러 개 가능)
}

interface LoadedTagger {
  config: TaggerConfig;
  voiceAudio: HTMLAudioElement;
  greenSprite: p5.Image | undefined;
  redSprites: (p5.Image | undefined)[];
}

/**
 * 배경음악 관리 클래스
 * - 게임 씬에 따라 배경음악 자동 전환
 * - 무한 재생 및 한 번만 재생 지원
 */
class BackgroundMusicManager {
  private currentScene: string = "";
  private currentAudio: HTMLAudioElement | null = null;
  private audioMap: Map<string, HTMLAudioElement> = new Map();
  private isInitialized: boolean = false; // 사용자 상호작용 후 초기화 여부

  constructor() {
    // 배경음악 파일 로드
    this.loadAudio("START", "assets/game_main.mp3", true);
    this.loadAudio("PLAYING", "assets/game_play.mp3", true);
    this.loadAudio("WIN", "assets/game_clear.mp3", false);
    this.loadAudio("LOSE", "assets/game_over.mp3", false);
  }

  /**
   * 오디오 파일 로드
   */
  private loadAudio(key: string, path: string, loop: boolean): void {
    const audio = new Audio(`${import.meta.env.BASE_URL}${path}`);
    audio.loop = loop;
    audio.volume = 0.5; // 볼륨 50%로 설정
    this.audioMap.set(key, audio);
    console.log(`🎵 배경음악 로드: ${key} (${path}) - loop: ${loop}`);
  }

  /**
   * 사용자 상호작용으로 음악 시스템 초기화
   * (브라우저 자동 재생 정책 우회)
   */
  initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log("🎵 배경음악 시스템 초기화됨 (사용자 상호작용 감지)");
  }

  /**
   * 음악 시스템 초기화 여부 확인
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 씬에 맞는 배경음악 재생
   */
  playMusicForScene(scene: string): void {
    // 이미 같은 씬의 음악이 재생 중이면 무시
    if (
      this.currentScene === scene &&
      this.currentAudio &&
      !this.currentAudio.paused
    ) {
      return;
    }

    // 현재 재생 중인 음악 정지
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    // 씬에 맞는 음악 선택
    let audioKey = scene;
    if (scene === "LOSE_CAUGHT" || scene === "LOSE_TIME") {
      audioKey = "LOSE"; // LOSE_CAUGHT, LOSE_TIME 모두 game_over.mp3 사용
    }

    const audio = this.audioMap.get(audioKey);
    if (audio) {
      this.currentAudio = audio;
      this.currentScene = scene;

      // 재생 시도 (브라우저가 허용하면 즉시 재생, 아니면 사용자 상호작용 필요)
      audio
        .play()
        .then(() => {
          console.log(`🎵 배경음악 재생: ${scene}`);
          this.isInitialized = true; // 재생 성공 시 초기화 플래그 설정
        })
        .catch((err) => {
          if (!this.isInitialized) {
            console.log(`⏸️ 배경음악 대기 중 (사용자 상호작용 필요): ${scene}`);
          } else {
            console.warn(`⚠️ 배경음악 재생 실패: ${err.message}`);
          }
        });
    } else {
      console.warn(`⚠️ 씬에 맞는 배경음악을 찾을 수 없음: ${scene}`);
    }
  }

  /**
   * 모든 배경음악 정지
   */
  stopAll(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.currentScene = "";
  }
}

/**
 * 술래 관리 클래스
 * - 여러 술래를 등록하고 랜덤으로 선택
 * - 음성과 스프라이트를 1:1로 연동
 * - 술래마다 여러 개의 빨간불 스프라이트 지원
 */
class TaggerManager {
  private taggers: LoadedTagger[] = [];
  private currentTagger: LoadedTagger | null = null;
  private currentRedSpriteIndex: number = 0;
  private p5Instance: p5;
  private isVoicePlaying: boolean = false;
  private onVoiceEndCallback: (() => void) | null = null;

  constructor(p5Instance: p5) {
    this.p5Instance = p5Instance;
  }

  /**
   * 술래 등록 및 에셋 로드
   */
  loadTagger(config: TaggerConfig): void {
    const tagger: LoadedTagger = {
      config,
      voiceAudio: new Audio(`${import.meta.env.BASE_URL}${config.voicePath}`),
      greenSprite: undefined,
      redSprites: [],
    };

    // 음성 종료 이벤트 리스너
    tagger.voiceAudio.addEventListener("ended", () => {
      console.log(`✅ [${config.name}] 음성 재생 완료`);
      this.isVoicePlaying = false;
      if (this.onVoiceEndCallback) {
        this.onVoiceEndCallback();
      }
    });

    // 초록불 스프라이트 로드
    this.p5Instance.loadImage(
      `${import.meta.env.BASE_URL}${config.greenSpritePath}`,
      (img) => {
        tagger.greenSprite = img;
        console.log(`✅ [${config.name}] 초록불 스프라이트 로드 성공`);
      },
      (err) => {
        console.error(`❌ [${config.name}] 초록불 스프라이트 로드 실패:`, err);
      }
    );

    // 빨간불 스프라이트들 로드
    config.redSpritePaths.forEach((path, index) => {
      this.p5Instance.loadImage(
        `${import.meta.env.BASE_URL}${path}`,
        (img) => {
          tagger.redSprites[index] = img;
          console.log(
            `✅ [${config.name}] 빨간불 스프라이트 ${index + 1} 로드 성공`
          );
        },
        (err) => {
          console.error(
            `❌ [${config.name}] 빨간불 스프라이트 ${index + 1} 로드 실패:`,
            err
          );
        }
      );
    });

    this.taggers.push(tagger);
    console.log(`✅ 술래 등록 완료: ${config.name}`);
  }

  /**
   * 랜덤으로 술래 선택
   */
  selectRandomTagger(): void {
    if (this.taggers.length === 0) {
      console.error("❌ 등록된 술래가 없습니다!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.taggers.length);
    this.currentTagger = this.taggers[randomIndex];
    console.log(`🎲 랜덤 술래 선택: ${this.currentTagger.config.name}`);
  }

  /**
   * 음성 재생 시작
   */
  playVoice(): void {
    if (!this.currentTagger) {
      console.error("❌ 선택된 술래가 없습니다!");
      return;
    }

    if (this.isVoicePlaying) {
      console.warn("⚠️ 이미 음성이 재생 중입니다.");
      return;
    }

    // 빨간불 스프라이트 랜덤 선택
    const redSpritesCount = this.currentTagger.config.redSpritePaths.length;
    this.currentRedSpriteIndex = Math.floor(Math.random() * redSpritesCount);

    this.currentTagger.voiceAudio.currentTime = 0;
    this.currentTagger.voiceAudio.play();
    this.isVoicePlaying = true;
    console.log(
      `🔊 [${
        this.currentTagger.config.name
      }] 음성 재생 시작 (빨간불 스프라이트: ${this.currentRedSpriteIndex + 1})`
    );
  }

  /**
   * 음성 정지
   */
  stopVoice(): void {
    if (this.currentTagger) {
      this.currentTagger.voiceAudio.pause();
      this.currentTagger.voiceAudio.currentTime = 0;
      this.isVoicePlaying = false;
    }
  }

  /**
   * 음성 종료 콜백 설정
   */
  setOnVoiceEnd(callback: () => void): void {
    this.onVoiceEndCallback = callback;
  }

  /**
   * 현재 술래의 초록불 스프라이트 가져오기
   */
  getCurrentGreenSprite(): p5.Image | undefined {
    return this.currentTagger?.greenSprite;
  }

  /**
   * 현재 술래의 빨간불 스프라이트 가져오기 (현재 선택된 것)
   */
  getCurrentRedSprite(): p5.Image | undefined {
    if (!this.currentTagger) return undefined;
    return this.currentTagger.redSprites[this.currentRedSpriteIndex];
  }

  /**
   * 음성 재생 중인지 확인
   */
  isPlaying(): boolean {
    return this.isVoicePlaying;
  }

  /**
   * 현재 술래 정보 가져오기
   */
  getCurrentTagger(): LoadedTagger | null {
    return this.currentTagger;
  }
}

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
let lastSecondUpdate: number = 0; // 마지막 초 업데이트 시각
let redLightStartTime: number = 0; // 빨간불 시작 시각
let currentPhase: "green" | "red" = "green"; // 현재 신호등 상태
let spacePressed: boolean = false; // 스페이스바가 현재 눌린 상태인지 추적

// 술래 관리자 (TaggerManager 인스턴스는 sketch 내부에서 생성)
let taggerManager: TaggerManager | null = null;

// 배경음악 관리자
let bgMusicManager: BackgroundMusicManager | null = null;

const RED_LIGHT_DURATION = 2000; // 빨간불 지속 시간 (ms)
const MOVE_DISTANCE_PER_PRESS = 0.5; // 한 번 누를 때마다 이동하는 거리 (m) - 50m / 100회 = 0.5m

const sketch = (p: p5) => {
  /* =================================
   * 애셋 변수 (갈아끼우기 쉽게 구조화)
   * ================================= */
  // 배경 이미지
  let imgBackground: p5.Image | undefined;
  const BACKGROUND_IMAGE_PATH = "assets/stone_stair.png"; // 🎨 배경 이미지 경로 (여기서 변경)

  /* =================================
   * 술래 설정 (여기서 술래를 추가/수정)
   * ================================= */
  const TAGGER_CONFIGS: TaggerConfig[] = [
    {
      id: "1ju",
      name: "1주차",
      voicePath: "assets/voice_1ju.m4a",
      greenSpritePath: "assets/human_thum.png",
      redSpritePaths: ["assets/1ju_1.png", "assets/1ju_2.png"],
    },
    // 🎨 새로운 술래를 추가하려면 여기에 추가하세요!
    // {
    //   id: "professor",
    //   name: "교수님",
    //   voicePath: "assets/voice_professor.m4a",
    //   greenSpritePath: "assets/professor_back.png",
    //   redSpritePaths: ["assets/professor_front1.png", "assets/professor_front2.png", "assets/professor_front3.png"],
    // },
  ];

  /* =================================
   * 게임 설정 (조정 가능)
   * ================================= */
  const ZOOM_FOCUS_Y_RATIO = 0.75; // 화면 하단에서 4분의 1 지점 (0.75 = 75% 아래)
  const PROFESSOR_Y_POSITION = 0.75; // 술래 위치: 화면 상단으로부터 75% 지점에 고정
  const BG_SCALE_MIN = 1.0; // 배경 최소 크기
  const BG_SCALE_MAX = 2.5; // 배경 최대 크기
  const PROFESSOR_SCALE_MIN = 1.0; // 술래 최소 크기
  const PROFESSOR_SCALE_MAX = 1.5; // 술래 최대 크기

  /* ---------------------------------
   * [공통] 최초 1회 설정
   * --------------------------------- */
  p.setup = () => {
    p.createCanvas(800, 600);
    p.textAlign(p.CENTER, p.CENTER);

    console.log("🎮 게임 초기화 시작...");
    console.log("BASE_URL:", import.meta.env.BASE_URL);

    // 배경 이미지 로드
    p.loadImage(
      `${import.meta.env.BASE_URL}${BACKGROUND_IMAGE_PATH}`,
      (img) => {
        imgBackground = img;
        console.log("✅ 배경 이미지 로드 성공");
      },
      (err) => {
        console.error("❌ 배경 이미지 로드 실패:", err);
      }
    );

    // TaggerManager 초기화 및 술래 등록
    taggerManager = new TaggerManager(p);
    TAGGER_CONFIGS.forEach((config) => {
      taggerManager!.loadTagger(config);
    });

    // 음성 종료 시 빨간불로 전환하는 콜백 설정
    taggerManager.setOnVoiceEnd(() => {
      console.log("✅ 음성 재생 완료 - 빨간불로 전환");
      currentPhase = "red";
      redLightStartTime = p.millis();
      gameData.isRedLight = true;
      gameData.subtitle = "!!!";
    });

    // BackgroundMusicManager 초기화 및 시작 음악 재생
    bgMusicManager = new BackgroundMusicManager();
    bgMusicManager.playMusicForScene("START");

    console.log("✅ 게임 초기화 완료");
  };

  /* ---------------------------------
   * 마우스 클릭 시 음악 초기화 (브라우저 자동 재생 정책 우회)
   * --------------------------------- */
  p.mousePressed = () => {
    // 첫 클릭 시 음악이 아직 재생되지 않았다면 재생 시도
    if (bgMusicManager && !bgMusicManager.getIsInitialized()) {
      bgMusicManager.playMusicForScene(gameData.currentScene);
    }
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
   * 게임 초기화 함수
   * ================================= */
  function resetGame() {
    // gameData 초기화
    gameData.currentScene = "START";
    gameData.distance = 50.0;
    gameData.timeLeft = 60;
    gameData.isRedLight = false;
    gameData.subtitle = "";

    // 내부 변수 초기화
    lastSecondUpdate = 0;
    redLightStartTime = 0;
    currentPhase = "green";
    spacePressed = false;

    // 음성 정지
    if (taggerManager) {
      taggerManager.stopVoice();
    }

    // 배경음악 전환
    if (bgMusicManager) {
      bgMusicManager.playMusicForScene("START");
    }

    console.log("🔄 게임 초기화 완료");
  }

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
    // 배경 이미지 그리기
    if (imgBackground && imgBackground.width > 0) {
      p.imageMode(p.CORNER);
      p.image(imgBackground, 0, 0, p.width, p.height);
    } else {
      p.background(200);
    }

    // 반투명 오버레이
    p.fill(0, 0, 0, 150);
    p.rect(0, 0, p.width, p.height);

    // 제목
    p.fill(255);
    p.textSize(48);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("무궁화 꽃이 피었습니다", p.width / 2, p.height / 2 - 50);

    // 안내 문구
    p.textSize(24);
    p.text("스페이스바를 눌러 시작하세요", p.width / 2, p.height / 2 + 50);

    // 음악이 아직 재생되지 않았다면 클릭 안내 표시
    if (bgMusicManager && !bgMusicManager.getIsInitialized()) {
      p.textSize(18);
      p.fill(255, 255, 0);
      p.text("(화면을 클릭하면 음악이 재생됩니다)", p.width / 2, p.height / 2 + 100);
    }
  }

  function A_drawWinScene() {
    // 배경 이미지 그리기
    if (imgBackground && imgBackground.width > 0) {
      p.imageMode(p.CORNER);
      p.image(imgBackground, 0, 0, p.width, p.height);
    } else {
      p.background(100, 200, 100);
    }

    // 반투명 초록 오버레이
    p.fill(0, 150, 0, 180);
    p.rect(0, 0, p.width, p.height);

    // 성공 메시지
    p.fill(255);
    p.textSize(64);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("성공!", p.width / 2, p.height / 2 - 50);

    // 재시작 안내
    p.textSize(24);
    p.text("스페이스바를 눌러 다시 시작", p.width / 2, p.height / 2 + 50);
  }

  function A_drawLoseScene(message: string) {
    // 배경 이미지 그리기
    if (imgBackground && imgBackground.width > 0) {
      p.imageMode(p.CORNER);
      p.image(imgBackground, 0, 0, p.width, p.height);
    } else {
      p.background(200, 100, 100);
    }

    // 반투명 빨간 오버레이
    p.fill(150, 0, 0, 180);
    p.rect(0, 0, p.width, p.height);

    // 탈락 메시지
    p.fill(255);
    p.textSize(64);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("탈락", p.width / 2, p.height / 2 - 80);

    // 실패 이유
    p.textSize(32);
    p.text(message, p.width / 2, p.height / 2 - 10);

    // 재시작 안내
    p.textSize(24);
    p.text("스페이스바를 눌러 다시 시작", p.width / 2, p.height / 2 + 60);
  }

  /* =================================
   * [B] 이승민 함수들
   * ================================= */
  function B_handleKeyPress() {
    // 첫 번째 키 입력 시 음악이 아직 재생되지 않았다면 재생 시도
    // (브라우저 자동 재생 정책으로 인해 페이지 로드 시 재생 실패했을 경우)
    if (bgMusicManager && !bgMusicManager.getIsInitialized()) {
      bgMusicManager.playMusicForScene(gameData.currentScene);
    }

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
        currentPhase = "green";
        gameData.isRedLight = false;
        gameData.subtitle = "";

        // 배경음악 전환
        if (bgMusicManager) {
          bgMusicManager.playMusicForScene("PLAYING");
        }

        // 랜덤으로 술래 선택 및 음성 재생 시작
        if (taggerManager) {
          taggerManager.selectRandomTagger();
          taggerManager.playVoice();
        }
      } else if (
        gameData.currentScene === "WIN" ||
        gameData.currentScene === "LOSE_CAUGHT" ||
        gameData.currentScene === "LOSE_TIME"
      ) {
        // 게임 종료 화면에서 재시작
        resetGame();
      } else if (gameData.currentScene === "PLAYING") {
        // 초록불일 때만 이동 가능
        if (!gameData.isRedLight) {
          gameData.distance -= MOVE_DISTANCE_PER_PRESS;
        } else {
          // 빨간불에 움직이면 즉시 잡힘
          gameData.currentScene = "LOSE_CAUGHT";

          // 배경음악 전환
          if (bgMusicManager) {
            bgMusicManager.playMusicForScene("LOSE_CAUGHT");
          }
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
      // 초록불 동안 음성이 재생됨
      // 음성 재생 완료 시 자동으로 빨간불로 전환 (ended 이벤트에서 처리)
      // 여기서는 특별한 처리 필요 없음
    } else if (currentPhase === "red") {
      const redElapsed = currentTime - redLightStartTime;

      // 빨간불 시간 종료 → 초록불로 전환
      if (redElapsed >= RED_LIGHT_DURATION) {
        currentPhase = "green";
        gameData.isRedLight = false;
        gameData.subtitle = "";

        // 랜덤으로 술래 선택 및 음성 재생 시작
        if (taggerManager) {
          taggerManager.selectRandomTagger();
          taggerManager.playVoice();
        }
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

      // 배경음악 전환
      if (bgMusicManager) {
        bgMusicManager.playMusicForScene("LOSE_TIME");
      }
    }

    // 승리 판정
    if (gameData.distance <= 0) {
      gameData.currentScene = "WIN";

      // 배경음악 전환
      if (bgMusicManager) {
        bgMusicManager.playMusicForScene("WIN");
      }
    }
  }

  /* =================================
   * [C] 김민후 함수들
   * ================================= */
  function C_drawWorld() {
    // 배경 회색으로 그리기 (기본)
    p.background(220);

    // PLAYING 상태일 때만 게임 월드 그리기
    if (gameData.currentScene === "PLAYING") {
      // 배경 이미지가 로드되었으면 원근감 있게 그리기
      if (imgBackground && imgBackground.width > 0) {
        // distance가 50 → 0으로 줄어들면 배경이 점점 확대됨
        const bgScale = p.map(
          gameData.distance,
          50,
          0,
          BG_SCALE_MIN,
          BG_SCALE_MAX
        );

        // 줌인 중심점: 화면 하단 4분의 1 지점 (광장 위치)
        const focusX = p.width / 2;
        const focusY = p.height * ZOOM_FOCUS_Y_RATIO;

        p.push();
        // 줌인 중심점으로 이동
        p.translate(focusX, focusY);
        // 확대
        p.scale(bgScale);
        // 다시 원점으로 이동하여 이미지 그리기
        p.translate(-focusX, -focusY);

        p.imageMode(p.CORNER);
        p.image(imgBackground, 0, 0, p.width, p.height);
        p.pop();
      }

      // 1인칭 원근법으로 술래 그리기
      // distance가 50 → 0으로 줄어들면 술래가 살짝만 커짐 (크기 변화 최소화)
      const scale = p.map(
        gameData.distance,
        50,
        0,
        PROFESSOR_SCALE_MIN,
        PROFESSOR_SCALE_MAX
      );
      // 술래 위치: 화면 상단으로부터 75% 지점에 고정
      const yPos = p.height * PROFESSOR_Y_POSITION;

      p.push();
      p.translate(p.width / 2, yPos);
      p.scale(scale);

      // 이미지 중심을 기준으로 그리기
      p.imageMode(p.CENTER);

      // 술래 이미지 그리기 (TaggerManager에서 가져옴)
      if (taggerManager) {
        let spriteToShow: p5.Image | undefined;

        if (gameData.isRedLight) {
          // 빨간불: 현재 선택된 술래의 빨간불 스프라이트
          spriteToShow = taggerManager.getCurrentRedSprite();
        } else {
          // 초록불: 현재 선택된 술래의 초록불 스프라이트
          spriteToShow = taggerManager.getCurrentGreenSprite();
        }

        if (spriteToShow && spriteToShow.width > 0) {
          p.image(spriteToShow, 0, 0, 100, 100);
        } else {
          // 이미지 로드 전 임시 원 표시
          p.fill(gameData.isRedLight ? [255, 100, 100] : [150]);
          p.ellipse(0, 0, 100, 100);
        }
      }

      p.pop();
    }
  }
};

// DOM이 완전히 로드된 후 p5 인스턴스 생성
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new p5(sketch);
  });
} else {
  new p5(sketch);
}

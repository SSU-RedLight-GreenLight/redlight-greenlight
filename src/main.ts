import p5 from "p5";
import { SceneManager } from "./core/SceneManager";
import { GameState } from "./core/GameState";
import { AssetManager } from "./core/AssetManager";
import { TaggerManager, TaggerConfig } from "./managers/TaggerManager";
import { BackgroundMusicManager } from "./managers/BackgroundMusicManager";
import { StartScene } from "./scenes/StartScene";
import { PlayingScene } from "./scenes/PlayingScene";
import { WinScene } from "./scenes/WinScene";
import { LoseScene } from "./scenes/LoseScene";
import { CreditsScene } from "./scenes/CreditsScene";

// p5.js의 Friendly Error System 비활성화 (성능 향상 및 에러 방지)
(window as any).p5 = p5;
(p5 as any).disableFriendlyErrors = true;

/* =================================
 * 술래 설정 (여기서 술래를 추가/수정)
 * ================================= */
const TAGGER_CONFIGS: TaggerConfig[] = [
  {
    id: "1ju",
    name: "1주차",
    voicePath: "assets/sound/sound_pf_1ju_1.mp3",
    greenSpritePath: "assets/pf/pf_back_no_bg.png",
    redSpritePaths: ["assets/pf/pf_1ju_no_bg.png"],
  },
  {
    id: "kc",
    name: "KC",
    voicePath: "assets/sound/sound_pf_kc_1.mp3",
    greenSpritePath: "assets/pf/pf_back_no_bg.png",
    redSpritePaths: ["assets/pf/pf_kc_no_bg.png"],
  },
  {
    id: "jw",
    name: "JW",
    voicePath: "assets/sound/sound_pf_jw_1.mp3",
    greenSpritePath: "assets/pf/pf_back_no_bg.png",
    redSpritePaths: ["assets/pf/pf_jw_no_bg.png"],
  },
];

/* =================================
 * 게임 설정
 * ================================= */
const BACKGROUND_IMAGE_PATH = "assets/stone_stair.png";

const sketch = (p: p5) => {
  // 전역 관리자 인스턴스
  let sceneManager: SceneManager;
  let gameState: GameState;
  let assetManager: AssetManager;
  let taggerManager: TaggerManager;
  let bgMusicManager: BackgroundMusicManager;

  /* ---------------------------------
   * setup: 최초 1회 설정
   * --------------------------------- */
  p.setup = () => {
    p.createCanvas(800, 600);
    p.textAlign(p.CENTER, p.CENTER);

    console.log("🎮 게임 초기화 시작...");
    console.log("BASE_URL:", import.meta.env.BASE_URL);

    // AssetManager 초기화 및 배경 이미지 로드
    assetManager = AssetManager.getInstance();
    assetManager.loadBackgroundImage(p, BACKGROUND_IMAGE_PATH);

    // 게임 상태 초기화
    gameState = GameState.getInstance();

    // TaggerManager 초기화 및 술래 등록
    taggerManager = new TaggerManager(p);
    TAGGER_CONFIGS.forEach((config) => {
      taggerManager.loadTagger(config);
    });

    // 음성 종료 시 빨간불로 전환하는 콜백 설정
    taggerManager.setOnVoiceEnd(() => {
      console.log("✅ 음성 재생 완료 - 빨간불로 전환");
      gameState.currentPhase = "red";
      gameState.redLightStartTime = p.millis();
      gameState.data.isRedLight = true;
      gameState.data.subtitle = "!!!";
    });

    // BackgroundMusicManager 초기화
    bgMusicManager = new BackgroundMusicManager();

    // SceneManager 초기화
    sceneManager = new SceneManager();

    // 씬 등록
    sceneManager.addScene(
      "START",
      new StartScene(p, sceneManager, bgMusicManager)
    );
    sceneManager.addScene(
      "PLAYING",
      new PlayingScene(
        p,
        sceneManager,
        gameState,
        taggerManager,
        bgMusicManager
      )
    );
    sceneManager.addScene("WIN", new WinScene(p, sceneManager, bgMusicManager));
    sceneManager.addScene(
      "LOSE_CAUGHT",
      new LoseScene(p, sceneManager, bgMusicManager, "CAUGHT")
    );
    sceneManager.addScene(
      "LOSE_TIME",
      new LoseScene(p, sceneManager, bgMusicManager, "TIME")
    );
    sceneManager.addScene(
      "CREDITS",
      new CreditsScene(p, sceneManager, bgMusicManager)
    );

    // 시작 씬으로 전환
    sceneManager.switchTo("START");

    console.log("✅ 게임 초기화 완료");
  };

  /* ---------------------------------
   * draw: 매 프레임 실행
   * --------------------------------- */
  p.draw = () => {
    sceneManager.update();
    sceneManager.draw();
  };

  /* ---------------------------------
   * 입력 처리
   * --------------------------------- */
  p.keyPressed = () => {
    // 첫 번째 키 입력 시 음악 초기화
    if (!bgMusicManager.getIsInitialized()) {
      bgMusicManager.playMusicForScene(sceneManager.getCurrentSceneName());
    }

    sceneManager.keyPressed();
  };

  p.keyReleased = () => {
    sceneManager.keyReleased();
  };

  p.mousePressed = () => {
    sceneManager.mousePressed();
  };
};

// DOM이 완전히 로드된 후 p5 인스턴스 생성
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new p5(sketch);
  });
} else {
  new p5(sketch);
}

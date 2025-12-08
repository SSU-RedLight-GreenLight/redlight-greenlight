import p5 from "p5";
import { BaseScene } from "../core/Scene";
import { SceneManager } from "../core/SceneManager";
import { GameState } from "../core/GameState";
import { AssetManager } from "../core/AssetManager";
import { TaggerManager } from "../managers/TaggerManager";
import { BackgroundMusicManager } from "../managers/BackgroundMusicManager";

/**
 * 게임 진행 씬
 */
export class PlayingScene extends BaseScene {
  private sceneManager: SceneManager;
  private gameState: GameState;
  private taggerManager: TaggerManager;
  private bgMusicManager: BackgroundMusicManager;
  private assetManager: AssetManager;

  // 게임 설정
  private readonly RED_LIGHT_DURATION = 2000; // 빨간불 지속 시간 (ms)
  private readonly MOVE_DISTANCE_PER_PRESS = 0.5; // 한 번 누를 때마다 이동하는 거리 (m)
  private readonly ZOOM_FOCUS_Y_RATIO = 0.75;
  private readonly PROFESSOR_Y_POSITION = 0.75;
  private readonly BG_SCALE_MIN = 1.0;
  private readonly BG_SCALE_MAX = 2.5;
  private readonly PROFESSOR_SCALE_MIN = 1.5;
  private readonly PROFESSOR_SCALE_MAX = 4.0;

  constructor(
    p5Instance: p5,
    sceneManager: SceneManager,
    gameState: GameState,
    taggerManager: TaggerManager,
    bgMusicManager: BackgroundMusicManager
  ) {
    super(p5Instance);
    this.sceneManager = sceneManager;
    this.gameState = gameState;
    this.taggerManager = taggerManager;
    this.bgMusicManager = bgMusicManager;
    this.assetManager = AssetManager.getInstance();
  }

  init(): void {
    console.log("🎬 게임 진행 화면 초기화");

    // 게임 상태 초기화
    this.gameState.reset();
    this.gameState.lastSecondUpdate = this.p.millis();
    this.gameState.currentPhase = "green";

    // 배경음악 전환
    this.bgMusicManager.playMusicForScene("PLAYING");

    // 랜덤으로 술래 선택 및 음성 재생 시작
    this.taggerManager.selectRandomTagger();
    this.taggerManager.playVoice();
  }

  update(): void {
    const currentTime = this.p.millis();

    // 1. 타이머 로직: 신호등 전환
    if (this.gameState.currentPhase === "green") {
      // 초록불 동안 음성이 재생됨
      // 음성 재생 완료 시 자동으로 빨간불로 전환 (ended 이벤트에서 처리)
    } else if (this.gameState.currentPhase === "red") {
      const redElapsed = currentTime - this.gameState.redLightStartTime;

      // 빨간불 시간 종료 → 초록불로 전환
      if (redElapsed >= this.RED_LIGHT_DURATION) {
        this.gameState.currentPhase = "green";
        this.gameState.data.isRedLight = false;
        // this.gameState.data.subtitle = "";

        // 랜덤으로 술래 선택 및 음성 재생 시작
        this.taggerManager.selectRandomTagger();
        this.taggerManager.playVoice();
      }
    }

    // 2. 시간 로직: 1초마다 timeLeft 감소
    if (currentTime - this.gameState.lastSecondUpdate >= 1000) {
      this.gameState.data.timeLeft--;
      this.gameState.lastSecondUpdate = currentTime;
    }

    // 3. 판정 로직
    // 시간 초과 판정
    if (this.gameState.data.timeLeft <= 0) {
      this.sceneManager.switchTo("LOSE_TIME");
      return;
    }

    // 승리 판정
    if (this.gameState.data.distance <= 0) {
      this.sceneManager.switchTo("WIN");
      return;
    }
  }

  draw(): void {
    // 배경 회색으로 그리기 (기본)
    this.p.background(220);

    // 배경 이미지가 로드되었으면 원근감 있게 그리기
    const imgBackground = this.assetManager.imgBackground;
    if (imgBackground && imgBackground.width > 0) {
      // distance가 50 → 0으로 줄어들면 배경이 점점 확대됨
      const bgScale = this.p.map(
        this.gameState.data.distance,
        50,
        0,
        this.BG_SCALE_MIN,
        this.BG_SCALE_MAX
      );

      // 줌인 중심점: 화면 하단 4분의 1 지점 (광장 위치)
      const focusX = this.p.width / 2;
      const focusY = this.p.height * this.ZOOM_FOCUS_Y_RATIO;

      this.p.push();
      // 줌인 중심점으로 이동
      this.p.translate(focusX, focusY);
      // 확대
      this.p.scale(bgScale);
      // 다시 원점으로 이동하여 이미지 그리기
      this.p.translate(-focusX, -focusY);

      this.p.imageMode(this.p.CORNER);
      this.p.image(imgBackground, 0, 0, this.p.width, this.p.height);
      this.p.pop();
    }

    // 1인칭 원근법으로 술래 그리기
    const scale = this.p.map(
      this.gameState.data.distance,
      50,
      0,
      this.PROFESSOR_SCALE_MIN,
      this.PROFESSOR_SCALE_MAX
    );
    const yPos = this.p.height * this.PROFESSOR_Y_POSITION;

    this.p.push();
    this.p.translate(this.p.width / 2, yPos);
    this.p.scale(scale);

    // 이미지 중심을 기준으로 그리기
    this.p.imageMode(this.p.CENTER);

    // 술래 이미지 그리기
    let spriteToShow: p5.Image | undefined;

    if (this.gameState.data.isRedLight) {
      spriteToShow = this.taggerManager.getCurrentRedSprite();
    } else {
      spriteToShow = this.taggerManager.getCurrentGreenSprite();
    }

    if (spriteToShow && spriteToShow.width > 0) {
      this.p.image(spriteToShow, 0, 0, 100, 100);
    } else {
      // 이미지 로드 전 임시 원 표시
      this.p.fill(this.gameState.data.isRedLight ? [255, 100, 100] : [150]);
      this.p.ellipse(0, 0, 100, 100);
    }

    this.p.pop();

    // HUD 그리기
    this.drawHUD();
  }

  private drawHUD(): void {
    this.p.fill(0);
    this.p.textSize(20);
    this.p.textAlign(this.p.LEFT, this.p.TOP);
    this.p.text(`거리: ${this.gameState.data.distance.toFixed(1)}m`, 20, 20);
    this.p.text(`시간: ${this.gameState.data.timeLeft}초`, 20, 50);

    // // 자막 표시
    // if (this.gameState.data.subtitle) {
    //   this.p.textAlign(this.p.CENTER, this.p.CENTER);
    //   this.p.textSize(32);
    //   this.p.text(
    //     this.gameState.data.subtitle,
    //     this.p.width / 2,
    //     this.p.height - 80
    //   );
    // }
  }

  keyPressed(): void {
    // 스페이스바 처리
    if (this.p.keyCode === 32) {
      // 이미 눌린 상태면 무시 (중복 입력 방지)
      if (this.gameState.spacePressed) {
        return;
      }
      this.gameState.spacePressed = true;

      // 초록불일 때만 이동 가능
      if (!this.gameState.data.isRedLight) {
        this.gameState.data.distance -= this.MOVE_DISTANCE_PER_PRESS;
      } else {
        // 빨간불에 움직이면 즉시 잡힘
        this.sceneManager.switchTo("LOSE_CAUGHT");
      }
    }
  }

  keyReleased(): void {
    // 스페이스바를 뗐을 때 플래그 해제
    if (this.p.keyCode === 32) {
      this.gameState.spacePressed = false;
    }
  }

  cleanup(): void {
    console.log("🧹 게임 진행 화면 정리");
    // 음성 정지
    this.taggerManager.stopVoice();
  }
}

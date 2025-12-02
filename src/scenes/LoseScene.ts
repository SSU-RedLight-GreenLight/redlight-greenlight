import p5 from "p5";
import { BaseScene } from "../core/Scene";
import { SceneManager } from "../core/SceneManager";
import { AssetManager } from "../core/AssetManager";
import { BackgroundMusicManager } from "../managers/BackgroundMusicManager";

/**
 * 패배 화면 씬
 */
export class LoseScene extends BaseScene {
  private sceneManager: SceneManager;
  private bgMusicManager: BackgroundMusicManager;
  private assetManager: AssetManager;
  private loseType: "CAUGHT" | "TIME";

  constructor(
    p5Instance: p5,
    sceneManager: SceneManager,
    bgMusicManager: BackgroundMusicManager,
    loseType: "CAUGHT" | "TIME"
  ) {
    super(p5Instance);
    this.sceneManager = sceneManager;
    this.bgMusicManager = bgMusicManager;
    this.assetManager = AssetManager.getInstance();
    this.loseType = loseType;
  }

  init(): void {
    console.log(`🎬 패배 화면 초기화 (${this.loseType})`);
    this.bgMusicManager.playMusicForScene("LOSE");
  }

  update(): void {
    // 패배 화면에서는 업데이트 로직 없음
  }

  draw(): void {
    // 배경 이미지 그리기
    const imgBackground = this.assetManager.imgBackground;
    if (imgBackground && imgBackground.width > 0) {
      this.p.imageMode(this.p.CORNER);
      this.p.image(imgBackground, 0, 0, this.p.width, this.p.height);
    } else {
      this.p.background(200, 100, 100);
    }

    // 반투명 빨간 오버레이
    this.p.fill(150, 0, 0, 180);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // 탈락 메시지
    this.p.fill(255);
    this.p.textSize(64);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("탈락", this.p.width / 2, this.p.height / 2 - 80);

    // 실패 이유
    this.p.textSize(32);
    const message = this.loseType === "CAUGHT" ? "잡혔습니다!" : "시간 초과!";
    this.p.text(message, this.p.width / 2, this.p.height / 2 - 10);

    // 재시작 안내
    this.p.textSize(24);
    this.p.text("스페이스바를 눌러 다시 시작", this.p.width / 2, this.p.height / 2 + 60);
  }

  keyPressed(): void {
    // 스페이스바로 재시작
    if (this.p.keyCode === 32) {
      this.sceneManager.switchTo("START");
    }
  }

  cleanup(): void {
    console.log("🧹 패배 화면 정리");
  }
}

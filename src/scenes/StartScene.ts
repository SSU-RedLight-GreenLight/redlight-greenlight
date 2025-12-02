import p5 from "p5";
import { BaseScene } from "../core/Scene";
import { SceneManager } from "../core/SceneManager";
import { AssetManager } from "../core/AssetManager";
import { BackgroundMusicManager } from "../managers/BackgroundMusicManager";

/**
 * 시작 화면 씬
 */
export class StartScene extends BaseScene {
  private sceneManager: SceneManager;
  private bgMusicManager: BackgroundMusicManager;
  private assetManager: AssetManager;

  constructor(
    p5Instance: p5,
    sceneManager: SceneManager,
    bgMusicManager: BackgroundMusicManager
  ) {
    super(p5Instance);
    this.sceneManager = sceneManager;
    this.bgMusicManager = bgMusicManager;
    this.assetManager = AssetManager.getInstance();
  }

  init(): void {
    console.log("🎬 시작 화면 초기화");
    this.bgMusicManager.playMusicForScene("START");
  }

  update(): void {
    // 시작 화면에서는 업데이트 로직 없음
  }

  draw(): void {
    // 배경 이미지 그리기
    const imgBackground = this.assetManager.imgBackground;
    if (imgBackground && imgBackground.width > 0) {
      this.p.imageMode(this.p.CORNER);
      this.p.image(imgBackground, 0, 0, this.p.width, this.p.height);
    } else {
      this.p.background(200);
    }

    // 반투명 오버레이
    this.p.fill(0, 0, 0, 150);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // 제목
    this.p.fill(255);
    this.p.textSize(48);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("무궁화 꽃이 피었습니다", this.p.width / 2, this.p.height / 2 - 50);

    // 안내 문구
    this.p.textSize(24);
    this.p.text("스페이스바를 눌러 시작하세요", this.p.width / 2, this.p.height / 2 + 50);

    // 음악이 아직 재생되지 않았다면 클릭 안내 표시
    if (!this.bgMusicManager.getIsInitialized()) {
      this.p.textSize(18);
      this.p.fill(255, 255, 0);
      this.p.text(
        "(화면을 클릭하면 음악이 재생됩니다)",
        this.p.width / 2,
        this.p.height / 2 + 100
      );
    }
  }

  keyPressed(): void {
    // 스페이스바로 게임 시작
    if (this.p.keyCode === 32) {
      this.sceneManager.switchTo("PLAYING");
    }
  }

  mousePressed(): void {
    // 첫 클릭 시 음악 초기화
    if (!this.bgMusicManager.getIsInitialized()) {
      this.bgMusicManager.playMusicForScene("START");
    }
  }

  cleanup(): void {
    console.log("🧹 시작 화면 정리");
  }
}

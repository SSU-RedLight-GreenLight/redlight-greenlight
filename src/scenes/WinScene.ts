import p5 from "p5";
import { BaseScene } from "../core/Scene";
import { SceneManager } from "../core/SceneManager";
import { AssetManager } from "../core/AssetManager";
import { BackgroundMusicManager } from "../managers/BackgroundMusicManager";
import { Button } from "../ui/Button";

/**
 * 승리 화면 씬
 */
export class WinScene extends BaseScene {
  private sceneManager: SceneManager;
  private bgMusicManager: BackgroundMusicManager;
  private assetManager: AssetManager;
  private restartButton: Button | null = null;

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
    console.log("🎬 승리 화면 초기화");
    this.bgMusicManager.playMusicForScene("WIN");

    // 다시 하기 버튼 생성
    this.restartButton = new Button(
      this.p,
      this.p.width / 2,
      this.p.height / 2 + 80,
      200,
      60,
      "다시 하기",
      () => {
        this.sceneManager.switchTo("START");
      },
      {
        bgColor: this.p.color(70, 130, 180), // 파란색
        hoverColor: this.p.color(100, 160, 210), // 밝은 파란색
        textSize: 28,
      }
    );
  }

  update(): void {
    // 승리 화면에서는 업데이트 로직 없음
  }

  draw(): void {
    // 배경 이미지 그리기
    const imgBackground = this.assetManager.imgBackground;
    if (imgBackground && imgBackground.width > 0) {
      this.p.imageMode(this.p.CORNER);
      this.p.image(imgBackground, 0, 0, this.p.width, this.p.height);
    } else {
      this.p.background(100, 200, 100);
    }

    // 반투명 초록 오버레이
    this.p.fill(0, 150, 0, 180);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // 성공 메시지
    this.p.fill(255);
    this.p.textSize(64);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("성공!", this.p.width / 2, this.p.height / 2 - 50);

    // 다시 하기 버튼 그리기
    if (this.restartButton) {
      this.restartButton.draw();
    }

    // 커서 초기화
    if (this.restartButton && !this.restartButton.getIsHovered()) {
      this.p.cursor(this.p.ARROW);
    }
  }

  keyPressed(): void {
    // 키보드 입력은 더 이상 사용하지 않음 (버튼으로 대체)
  }

  mousePressed(): void {
    // 버튼 클릭 처리
    if (this.restartButton) {
      this.restartButton.handleClick();
    }
  }

  cleanup(): void {
    console.log("🧹 승리 화면 정리");
  }
}

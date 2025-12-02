import p5 from "p5";
import { BaseScene } from "../core/Scene";
import { SceneManager } from "../core/SceneManager";
import { AssetManager } from "../core/AssetManager";
import { BackgroundMusicManager } from "../managers/BackgroundMusicManager";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

/**
 * 패배 화면 씬
 */
export class LoseScene extends BaseScene {
  private sceneManager: SceneManager;
  private bgMusicManager: BackgroundMusicManager;
  private assetManager: AssetManager;
  private loseType: "CAUGHT" | "TIME";
  private restartButton: Button | null = null;
  private creditsButton: IconButton | null = null;

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

    // 다시 하기 버튼 생성
    this.restartButton = new Button(
      this.p,
      this.p.width / 2,
      this.p.height / 2 + 90,
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

    // 크레딧 아이콘 버튼 생성 (우측 상단)
    this.creditsButton = new IconButton(
      this.p,
      this.p.width - 40,
      40,
      50,
      "ⓘ",
      () => {
        this.sceneManager.switchTo("CREDITS");
      },
      {
        bgColor: this.p.color(255, 255, 255, 150),
        hoverColor: this.p.color(255, 255, 255, 230),
        iconColor: this.p.color(0),
      }
    );
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

    // 다시 하기 버튼 그리기
    if (this.restartButton) {
      this.restartButton.draw();
    }

    // 크레딧 아이콘 버튼 그리기
    if (this.creditsButton) {
      this.creditsButton.draw();
    }

    // 커서 초기화
    const anyHovered =
      (this.restartButton && this.restartButton.getIsHovered()) ||
      (this.creditsButton && this.creditsButton.getIsHovered());
    if (!anyHovered) {
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
    if (this.creditsButton) {
      this.creditsButton.handleClick();
    }
  }

  cleanup(): void {
    console.log("🧹 패배 화면 정리");
  }
}

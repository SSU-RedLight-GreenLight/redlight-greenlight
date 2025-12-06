import p5 from "p5";
import { BaseScene } from "../core/Scene";
import { SceneManager } from "../core/SceneManager";
import { AssetManager } from "../core/AssetManager";
import { BackgroundMusicManager } from "../managers/BackgroundMusicManager";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

/**
 * 시작 화면 씬
 */
export class StartScene extends BaseScene {
  private sceneManager: SceneManager;
  private bgMusicManager: BackgroundMusicManager;
  private assetManager: AssetManager;
  private startButton: Button | null = null;
  private creditsButton: IconButton | null = null;
  private logoX: number = 50;
  private logoY: number = 50;
  private logoSize: number = 80;

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

    // 시작 버튼 생성
    this.startButton = new Button(
      this.p,
      this.p.width / 2,
      this.p.height / 2 + 80,
      200,
      60,
      "게임 시작",
      () => {
        this.sceneManager.switchTo("PLAYING");
      },
      {
        bgColor: this.p.color(34, 139, 34), // 초록색
        hoverColor: this.p.color(50, 205, 50), // 밝은 초록색
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
    this.p.text(
      "무궁화 꽃이 피었습니다",
      this.p.width / 2,
      this.p.height / 2 - 50
    );

    // 안내 문구
    this.p.textSize(20);
    this.p.fill(200);
    // this.p.text("스페이스바를 눌러 이동하세요", this.p.width / 2, this.p.height / 2 + 20);

    // 시작 버튼 그리기
    if (this.startButton) {
      this.startButton.draw();
    }

    // 크레딧 아이콘 버튼 그리기
    if (this.creditsButton) {
      this.creditsButton.draw();
    }

    // SSU DM 로고 그리기 (좌측 상단)
    const ssuLogo = this.assetManager.ssuDmLogo;
    if (ssuLogo && ssuLogo.width > 0) {
      this.p.imageMode(this.p.CENTER);
      this.p.image(
        ssuLogo,
        this.logoX,
        this.logoY,
        this.logoSize,
        this.logoSize
      );

      // 로고 위에 마우스가 있으면 커서를 포인터로 변경
      if (this.isLogoHovered()) {
        this.p.cursor(this.p.HAND);
      }
    }

    // 음악이 아직 재생되지 않았다면 클릭 안내 표시
    if (!this.bgMusicManager.getIsInitialized()) {
      this.p.textSize(16);
      this.p.fill(255, 255, 0);
      this.p.text(
        "(화면을 클릭하면 음악이 재생됩니다)",
        this.p.width / 2,
        this.p.height - 30
      );
    }

    // 커서 초기화 (버튼이나 로고가 호버되지 않으면 기본 커서)
    const anyHovered =
      (this.startButton && this.startButton.getIsHovered()) ||
      (this.creditsButton && this.creditsButton.getIsHovered()) ||
      this.isLogoHovered();
    if (!anyHovered) {
      this.p.cursor(this.p.ARROW);
    }
  }

  /**
   * 로고 위에 마우스가 있는지 확인
   */
  private isLogoHovered(): boolean {
    const halfSize = this.logoSize / 2;
    return (
      this.p.mouseX >= this.logoX - halfSize &&
      this.p.mouseX <= this.logoX + halfSize &&
      this.p.mouseY >= this.logoY - halfSize &&
      this.p.mouseY <= this.logoY + halfSize
    );
  }

  keyPressed(): void {
    // 키보드 입력은 더 이상 사용하지 않음 (버튼으로 대체)
  }

  mousePressed(): void {
    // 첫 클릭 시 음악 초기화
    if (!this.bgMusicManager.getIsInitialized()) {
      this.bgMusicManager.playMusicForScene("START");
    }

    // 로고 클릭 시 미디어경영학과 홈페이지로 이동
    if (this.isLogoHovered()) {
      window.open("https://mediamba.ssu.ac.kr/", "_blank");
      return;
    }

    // 버튼 클릭 처리
    if (this.startButton) {
      this.startButton.handleClick();
    }
    if (this.creditsButton) {
      this.creditsButton.handleClick();
    }
  }

  cleanup(): void {
    console.log("🧹 시작 화면 정리");
  }
}

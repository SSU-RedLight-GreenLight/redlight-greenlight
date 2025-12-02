import p5 from "p5";
import { BaseScene } from "../core/Scene";
import { SceneManager } from "../core/SceneManager";
import { AssetManager } from "../core/AssetManager";
import { BackgroundMusicManager } from "../managers/BackgroundMusicManager";
import { Button } from "../ui/Button";

/**
 * 크레딧 화면 씬
 */
export class CreditsScene extends BaseScene {
  private sceneManager: SceneManager;
  private bgMusicManager: BackgroundMusicManager; // 향후 크레딧 음악 재생에 사용 가능
  private assetManager: AssetManager;
  private backButton: Button | null = null;
  private scrollOffset: number = 0;
  private readonly SCROLL_SPEED = 3;
  private readonly AUTO_SCROLL_SPEED = 0.5;
  private readonly MAX_SCROLL = 1000; // 최대 스크롤 높이 (크레딧 전체 높이)
  private autoScrollEnabled: boolean = true; // 자동 스크롤 활성화 여부
  private lastManualScrollTime: number = 0; // 마지막 수동 스크롤 시간
  private readonly MANUAL_SCROLL_PAUSE_DURATION = 3000; // 수동 스크롤 후 자동 스크롤 재개까지 대기 시간 (ms)

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
    console.log("🎬 크레딧 화면 초기화");
    this.scrollOffset = 0;

    // 뒤로 가기 버튼 생성
    this.backButton = new Button(
      this.p,
      this.p.width / 2,
      this.p.height - 60,
      200,
      50,
      "뒤로 가기",
      () => {
        this.sceneManager.switchTo("START");
      },
      {
        bgColor: this.p.color(100, 100, 100),
        hoverColor: this.p.color(150, 150, 150),
        textSize: 24,
      }
    );
  }

  update(): void {
    // 수동 스크롤 후 일정 시간이 지나면 자동 스크롤 재개
    const currentTime = this.p.millis();
    if (
      !this.autoScrollEnabled &&
      currentTime - this.lastManualScrollTime >
        this.MANUAL_SCROLL_PAUSE_DURATION
    ) {
      this.autoScrollEnabled = true;
    }

    // 자동 스크롤 업데이트
    if (this.autoScrollEnabled) {
      this.scrollOffset += this.AUTO_SCROLL_SPEED;

      // 스크롤이 끝까지 가면 처음으로 되돌리기
      if (this.scrollOffset > this.MAX_SCROLL) {
        this.scrollOffset = 0;
      }
    }
  }

  draw(): void {
    // 배경 이미지 그리기
    const imgBackground = this.assetManager.imgBackground;
    if (imgBackground && imgBackground.width > 0) {
      this.p.imageMode(this.p.CORNER);
      this.p.image(imgBackground, 0, 0, this.p.width, this.p.height);
    } else {
      this.p.background(40, 40, 60);
    }

    // 반투명 오버레이
    this.p.fill(0, 0, 0, 200);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // 크레딧 내용 그리기
    this.p.push();
    this.p.translate(0, -this.scrollOffset);

    let yPos = 80;
    const leftMargin = 80;
    const lineHeight = 35;

    // 제목
    this.p.fill(255, 215, 0); // 금색
    this.p.textSize(48);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("CREDITS", this.p.width / 2, yPos);
    yPos += 80;

    // 게임 제작자
    this.p.fill(100, 200, 255); // 밝은 파란색
    this.p.textSize(32);
    this.p.textAlign(this.p.LEFT, this.p.TOP);
    this.p.text("게임 제작자", leftMargin, yPos);
    yPos += 50;

    this.p.fill(255);
    this.p.textSize(24);
    this.p.text("이승민 20251692", leftMargin + 20, yPos);
    yPos += lineHeight;
    this.p.text("김민후 20253310", leftMargin + 20, yPos);
    yPos += lineHeight;
    this.p.text("이영애 20241110", leftMargin + 20, yPos);
    yPos += 70;

    // p5.js 주요 기능
    this.p.fill(100, 200, 255);
    this.p.textSize(32);
    this.p.text("사용한 p5.js 주요 기능", leftMargin, yPos);
    yPos += 50;

    this.p.fill(255);
    this.p.textSize(24);
    const p5Features = [
      "createCanvas() - 캔버스 생성",
      "loadImage() - 이미지 로딩",
      "image() - 이미지 렌더링",
      "translate() & scale() - 변환 및 확대/축소",
      "text() - 텍스트 렌더링",
      "fill() & stroke() - 색상 설정",
      "rect() & ellipse() - 도형 그리기",
      "mouseX, mouseY - 마우스 위치 추적",
      "keyPressed() & keyReleased() - 키보드 입력",
      "millis() - 시간 측정",
    ];

    p5Features.forEach((feature) => {
      this.p.text(feature, leftMargin + 20, yPos);
      yPos += lineHeight;
    });
    yPos += 50;

    // AI 생성 콘텐츠 - BGM
    this.p.fill(100, 200, 255);
    this.p.textSize(32);
    this.p.text("AI 생성 콘텐츠 - BGM", leftMargin, yPos);
    yPos += 50;

    this.p.fill(255);
    this.p.textSize(24);
    const bgmList = [
      "game_main.mp3 - 메인 화면 배경음악",
      "game_play.mp3 - 게임 플레이 배경음악",
      "game_clear.mp3 - 게임 클리어 음악",
      "game_over.mp3 - 게임 오버 음악",
    ];

    bgmList.forEach((bgm) => {
      this.p.text(bgm, leftMargin + 20, yPos);
      yPos += lineHeight;
    });
    yPos += 50;

    // AI 생성 콘텐츠 - 이미지
    this.p.fill(100, 200, 255);
    this.p.textSize(32);
    this.p.text("AI 생성 콘텐츠 - 이미지", leftMargin, yPos);
    yPos += 50;

    this.p.fill(255);
    this.p.textSize(24);
    const imageList = [
      "stone_stair.png - 배경 이미지 (계단)",
      "1ju_1.png - 1주차 술래 초록불 스프라이트",
      "1ju_2.png - 1주차 술래 빨간불 스프라이트",
      "human_thum.png - 플레이어 썸네일",
      "robot.png - 로봇 술래 스프라이트",
    ];

    imageList.forEach((image) => {
      this.p.text(image, leftMargin + 20, yPos);
      yPos += lineHeight;
    });
    yPos += 50;

    // AI 생성 콘텐츠 - 음성
    this.p.fill(100, 200, 255);
    this.p.textSize(32);
    this.p.text("AI 생성 콘텐츠 - 음성", leftMargin, yPos);
    yPos += 50;

    this.p.fill(255);
    this.p.textSize(24);
    const voiceList = [
      "1ju_voice.m4a - 1주차 술래 음성",
      "(추가 음성 파일들...)",
    ];

    voiceList.forEach((voice) => {
      this.p.text(voice, leftMargin + 20, yPos);
      yPos += lineHeight;
    });
    yPos += 80;

    // 감사 메시지
    this.p.fill(255, 215, 0);
    this.p.textSize(28);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("게임을 플레이해주셔서 감사합니다!", this.p.width / 2, yPos);

    this.p.pop();

    // 뒤로 가기 버튼 그리기 (항상 화면 하단에 고정)
    if (this.backButton) {
      this.backButton.draw();
    }

    // 커서 초기화
    if (this.backButton && !this.backButton.getIsHovered()) {
      this.p.cursor(this.p.ARROW);
    }
  }

  keyPressed(): void {
    // 위/아래 화살표로 스크롤
    if (this.p.keyCode === this.p.UP_ARROW) {
      this.scrollOffset -= this.SCROLL_SPEED * 5;
      if (this.scrollOffset < 0) this.scrollOffset = 0;

      // 수동 스크롤 시 자동 스크롤 일시 정지
      this.autoScrollEnabled = false;
      this.lastManualScrollTime = this.p.millis();
    } else if (this.p.keyCode === this.p.DOWN_ARROW) {
      this.scrollOffset += this.SCROLL_SPEED * 5;

      // 수동 스크롤 시 자동 스크롤 일시 정지
      this.autoScrollEnabled = false;
      this.lastManualScrollTime = this.p.millis();
    }
  }

  mousePressed(): void {
    // 버튼 클릭 처리
    if (this.backButton) {
      this.backButton.handleClick();
    }
  }

  cleanup(): void {
    console.log("🧹 크레딧 화면 정리");
  }
}

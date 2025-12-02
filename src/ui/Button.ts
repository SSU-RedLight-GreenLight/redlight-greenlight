import p5 from "p5";

/**
 * 버튼 클래스
 * 클릭 가능한 UI 버튼
 */
export class Button {
  private p: p5;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private text: string;
  private onClick: () => void;
  private isHovered: boolean = false;

  // 스타일 설정
  private bgColor: p5.Color;
  private hoverColor: p5.Color;
  private textColor: p5.Color;
  private textSize: number;
  private cornerRadius: number;

  constructor(
    p5Instance: p5,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    onClick: () => void,
    options?: {
      bgColor?: p5.Color;
      hoverColor?: p5.Color;
      textColor?: p5.Color;
      textSize?: number;
      cornerRadius?: number;
    }
  ) {
    this.p = p5Instance;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.onClick = onClick;

    // 기본 스타일 설정
    this.bgColor = options?.bgColor || this.p.color(70, 130, 180); // 스틸 블루
    this.hoverColor = options?.hoverColor || this.p.color(100, 160, 210); // 밝은 스틸 블루
    this.textColor = options?.textColor || this.p.color(255);
    this.textSize = options?.textSize || 24;
    this.cornerRadius = options?.cornerRadius || 10;
  }

  /**
   * 버튼 그리기
   */
  draw(): void {
    // 마우스 호버 체크
    this.checkHover();

    // 버튼 배경
    this.p.push();
    this.p.fill(this.isHovered ? this.hoverColor : this.bgColor);
    this.p.noStroke();
    this.p.rectMode(this.p.CENTER);
    this.p.rect(this.x, this.y, this.width, this.height, this.cornerRadius);

    // 버튼 텍스트
    this.p.fill(this.textColor);
    this.p.textSize(this.textSize);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text(this.text, this.x, this.y);
    this.p.pop();
  }

  /**
   * 마우스 호버 체크
   */
  private checkHover(): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    this.isHovered =
      this.p.mouseX >= this.x - halfWidth &&
      this.p.mouseX <= this.x + halfWidth &&
      this.p.mouseY >= this.y - halfHeight &&
      this.p.mouseY <= this.y + halfHeight;

    // 호버 시 커서 변경
    if (this.isHovered) {
      this.p.cursor(this.p.HAND);
    }
  }

  /**
   * 마우스 클릭 처리
   */
  handleClick(): void {
    if (this.isHovered) {
      this.onClick();
    }
  }

  /**
   * 버튼 위치 변경
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 버튼 텍스트 변경
   */
  setText(text: string): void {
    this.text = text;
  }

  /**
   * 호버 상태 확인
   */
  getIsHovered(): boolean {
    return this.isHovered;
  }
}
